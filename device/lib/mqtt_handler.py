# MQTT connection + message handling

import logging
import random
import time
import paho.mqtt.client as mqtt   # type: ignore
import json
from lib.config import *
from lib.evkms_core import EVKMSDevice
from lib.utils import generate_nonce, compute_pairwise_digest, hash_key, start_periodic_task , compute_discovery_digest , get_sorted_guids
from lib.actions.revocation_handler import handle_revocation_alert 


from lib.actions.refresh_handler import handle_refresh_command 
from lib.actions.handle_key_refresh_broadcast import handle_key_refresh_broadcast

import lib.shared_state

from lib.shared_state import reported_key_establishment ,  device  ,is_this_device_revoked

from lib.log_handler import log_info, log_warning, log_error, log_discovery, log_key_mgmt



# Store our own sent nonces: { 'nonce_value': timestamp } to track active discoveries
active_discovery_nonces = {} 


def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        
        log_info("Connected to MQTT broker")

        
        # Subscribe to config topic
        config_topic = CONFIG_TOPIC_TEMPLATE.format(device_guid=DEVICE_GUID)
        client.subscribe(config_topic)

        # Subscribe to command topic
        command_topic = COMMAND_TOPIC_TEMPLATE.format(device_guid=DEVICE_GUID)
        client.subscribe(command_topic)

        # Subscribe to targeted key response topic
        key_response_topic = KEY_RESPONSE_TOPIC.format(target_guid=DEVICE_GUID)
        client.subscribe(key_response_topic, qos=1)

        # Subscribe to discovery topic
        discovery_subscription_topic = DISCOVERY_TOPIC.format(subset_guid=SUBSET_GUID)
        client.subscribe(discovery_subscription_topic)


         # Subscribe to subset broadcast alerts
        subset_alert_topic = SUBSET_ALERT_TOPIC.format(subset_guid=SUBSET_GUID) 
        client.subscribe(subset_alert_topic, qos=1)


        log_info("Subscribed to all required topics")


        # Start discovery protocol
        discovery_interval = random.uniform(60, 120)
        start_periodic_task(discovery_interval , lambda: broadcast_discovery(client))

        log_info(f"Started discovery protocol (interval: {discovery_interval:.1f}s)")

        
    else:
        log_error(f"Connection failed with code {rc}")



def broadcast_discovery(client):

    # Check if device is revoked
    if is_this_device_revoked['value']:
        log_error("Device is revoked, skipping discovery broadcast")
        return

    if not device.evkms_state["secret_i"]: # Don't discover if not provisioned
        log_warning("Not provisioned yet, skipping discovery broadcast")
        return


    # Generate nonce and track it 
    nonce = generate_nonce() 

    active_discovery_nonces[nonce] = time.time() 



    # Clean up old nonces 
    # This prevents active_discovery_nonces from growing indefinitely

    current_time = time.time()
    nonces_to_delete = [n for n, t in active_discovery_nonces.items() if current_time - t > 60]
    for n_del in nonces_to_delete:
        del active_discovery_nonces[n_del]


    discovery_msg = {
        "guid": DEVICE_GUID,
        "subset": SUBSET_GUID,
        "nonce": nonce,
        "digest": compute_discovery_digest(
                    device.evkms_state["secret_i"], 
                    DEVICE_GUID, 
                    nonce
                    )
    }
    

    # Publish discovery
    
    discovery_topic = DISCOVERY_TOPIC.format(subset_guid=SUBSET_GUID)

    client.publish(discovery_topic, json.dumps(discovery_msg), qos=1)

    log_discovery(f"Broadcasted discovery message (nonce: {nonce[:14]}...)")



def handle_discovery(client, msg):
    

    if device.is_this_device_revoked(): # Uses the flag for this specific device (self-revocation)
        log_error("This device is revoked, skipping handle discovery.")
        return
    

    if not device.evkms_state["secret_i"]:
        log_warning("Not provisioned yet, ignoring discovery message")
        return # Not provisioned


    try:
        data = json.loads(msg.payload)
        source_guid = data["guid"]
        nonce = data["nonce"] #This is Nonce_Source 
        received_digest = data["digest"]
        
        # Skip self-discovery
        if source_guid == DEVICE_GUID:
            return   
        


        #drop any discovery from a revoked peer
        if device.is_peer_revoked(source_guid):

            log_warning(f"Ignoring discovery from revoked device {source_guid}")

            return


        # CRITICAL FIX: Check if we already have a pairwise key with this peer
        # If yes, ignore this discovery to prevent duplicate key establishment
        if source_guid in device.evkms_state["pairwise_keys"]:
            log_info(f"Already have pairwise key with {source_guid}, ignoring discovery")
            return

        
        log_discovery(f"Received discovery from {source_guid}")

        # 1- Calculate Digest and  Verify Digset
        # Extract neighbor's local ID
        neighbor_local_id = source_guid.split("@")[-1]
        
        # Get neighbor's secret from Vc
        neighbor_secret_s_source = device.get_secret_from_vic(neighbor_local_id)


        if not neighbor_secret_s_source:
            log_error(f"No secret found for {source_guid} in Vc")
            return
        
        # Verify discovery digest
        expected_digest = compute_discovery_digest(neighbor_secret_s_source, source_guid, nonce)
        
        
        if expected_digest != received_digest:
            log_error(f"Discovery digest mismatch from {source_guid}")
            return
        
        #2- Compute pairwise key
        pairwise_key = device.compute_pairwise_key(source_guid, neighbor_secret_s_source, nonce)


        guid_a, guid_b = get_sorted_guids(DEVICE_GUID, source_guid)

        response_digest_material = f"{guid_a}{guid_b}{nonce}"
        
        #Generate HMAC proof using the computed key
        ack_digest = compute_pairwise_digest(pairwise_key, response_digest_material)
        

        # Send ACK
        ack_topic = KEY_RESPONSE_TOPIC.format(target_guid=source_guid)


        client.publish(ack_topic, json.dumps({
            "source_guid": DEVICE_GUID,
            "target_guid": source_guid,
            "original_nonce": nonce,
            "digest": ack_digest,
            "timestamp": time.time()
        }))


        
        #Store tentative key until ACK is received
        device.store_pairwise_key(source_guid, pairwise_key, nonce)
        log_key_mgmt(f"Sent key response to {source_guid} and stored tentative key")


    except Exception as e:
        log_error(f"Discovery handling error: {e}")



def handle_key_response(client, userdata, msg):
    """Processes a response to OUR discovery message."""
    
    if device.is_this_device_revoked():
        log_error("This device is revoked, ignoring key response.")
        return

    if not device.evkms_state["secret_i"]: 
        log_warning("Not provisioned yet, ignoring key response")
        return

    try:

        data = json.loads(msg.payload.decode('utf-8')) # Decode buffer
        responder_guid = data["source_guid"]    # Who sent this response (e.g., Device B)
        intended_target_guid = data["target_guid"] # Should be us (e.g., Device A)
        our_original_nonce = data["original_nonce"] # The nonce from OUR discovery broadcast
        received_response_digest = data["digest"]



        if intended_target_guid != DEVICE_GUID:
            return # This response isn't for us



        if our_original_nonce not in active_discovery_nonces:
            log_error(f"Received key response for unknown nonce from {responder_guid}")

            active_discovery_nonces.pop(our_original_nonce, None) # Clean up if somehow missed
            return




        log_key_mgmt(f"Received key response from {responder_guid} for our discovery (nonce: {our_original_nonce[:14]}...) Processing...")





        # Get responder's secret
        responder_local_id = responder_guid.split("@")[-1]
        responder_secret_s_responder = device.get_secret_from_vic(responder_local_id)

        if not responder_secret_s_responder:
            log_error(f"No secret found for {responder_guid} in Vc")
            active_discovery_nonces.pop(our_original_nonce, None) # Clean up nonce
            return



        # Compute (or re-compute if not already done for this specific nonce context) the pairwise key
        computed_key_with_responder = device.compute_pairwise_key(
            responder_guid,                 
            responder_secret_s_responder,   
            our_original_nonce              
        )

        # Verify response digest

        guid_a, guid_b = get_sorted_guids(DEVICE_GUID, responder_guid)

        expected_response_digest_material = f"{guid_a}{guid_b}{our_original_nonce}"

        expected_response_digest = compute_pairwise_digest(computed_key_with_responder, expected_response_digest_material)



        if received_response_digest == expected_response_digest:
                
                log_key_mgmt(f"✓ Established verified pairwise key with {responder_guid} or nonce {our_original_nonce[:14]}... .")


                # Key is confirmed. Store/update it and mark as verified.
                device.store_pairwise_key(responder_guid, computed_key_with_responder, our_original_nonce)

                active_discovery_nonces.pop(our_original_nonce, None) # This discovery for this nonce is now fully processed.


                # Inform server/gateway about this successfully established key (NEW)
                # Report to gateway IF not already reported for this specific peer.
                if not reported_key_establishment.get(responder_guid, False):
                    if lib.shared_state.discovered_gateway_guid:
                        
                        key_hash_for_server = hash_key(computed_key_with_responder) # Optional, but can be useful for logging/tracking without sending raw key
                        
                        status_payload_for_server = {
                            "deviceGuid": DEVICE_GUID, # This device
                            "status_type": "pairwise_key_established", # Clearer type
                            "peerDeviceGuid": responder_guid, # The other device
                            "keyContextNonce": our_original_nonce, # Context for this key establishment
                            "keyHash": key_hash_for_server, # Optional
                            "timestamp": time.time()
                        }
                        status_topic = STATUS_TOPIC_TEMPLATE.format(
                            gateway_guid=lib.shared_state.discovered_gateway_guid,
                            device_guid=DEVICE_GUID
                        )
                        client.publish(status_topic, json.dumps(status_payload_for_server), qos=1)

                        reported_key_establishment[responder_guid] = True


                        log_info(f"Reported key establishment with {responder_guid} to gateway")

                else:
                    log_info(f"Key with {responder_guid} already reported, skipping gateway report.")
        else:

            log_error(f"Key response digest mismatch from {responder_guid} for nonce {our_original_nonce[:14]}... .")

                    
            
    except Exception as e:
        log_error(f"Key response handling error: {e}")




def on_message(client, userdata, msg):
    """Main MQTT message handler"""

    if f"/devices/{DEVICE_GUID}/config" in msg.topic:
        handle_config(client, msg)
    
    elif msg.topic == DISCOVERY_TOPIC.format(subset_guid=SUBSET_GUID):
        handle_discovery(client, msg)


    elif f"/devices/{DEVICE_GUID}/key_response" in msg.topic:
        handle_key_response(client, userdata, msg)    

    elif f"/subsets/{SUBSET_GUID}/broadcast_alerts" in msg.topic: # NEW
        handle_revocation_alert(client, msg.payload)    

    elif f"/devices/{DEVICE_GUID}/commands" in msg.topic:
        handle_refresh_command(client, msg.payload)

    elif f"/subsets/{SUBSET_GUID}/key_refresh" in msg.topic:
        handle_key_refresh_broadcast(client, msg.payload)    



def handle_config(client, msg):
    """Process provisioning config topic"""

    try:
        
        payload = json.loads(msg.payload.decode('utf-8'))  # Decode buffer

        # Extract gateway GUID from topic
        topic_parts = msg.topic.split('/')

        lib.shared_state.discovered_gateway_guid = topic_parts[1] # set the gateway Gid for comunication later
        
        # Store EVKMS material
        device.load_evkms_payload(payload)
        

        log_info(f"✓ Received and loaded provisioning config from gateway {lib.shared_state.discovered_gateway_guid}")

        # Acknowledge provisioning for the gateway wit hstatus topic 
        status_topic = STATUS_TOPIC_TEMPLATE.format(
            gateway_guid=lib.shared_state.discovered_gateway_guid,
            device_guid=DEVICE_GUID
        )
        
        client.publish(status_topic, json.dumps({
            "status_type": "provisioned",
            "timestamp": time.time(),
            "taskId" : payload.get("taskId") , # Optional task ID for tracking 
            "deviceGuid": DEVICE_GUID,
            # "key_hash": hash_key(device.evkms_state["secret_i"])
        }), qos=1)
        
        log_info("Sent provisioning acknowledgment to gateway")
    except Exception as e:
        log_error(f"Config handling error: {e}")



def setup_mqtt():
    """Initialize MQTT client"""

    mqtt_logger = logging.getLogger('paho.mqtt')
    mqtt_logger.setLevel(logging.WARNING)

    client = mqtt.Client(
        client_id=DEVICE_GUID,
        protocol=mqtt.MQTTv311,
        callback_api_version=mqtt.CallbackAPIVersion.VERSION1
    )
    
    # client.enable_logger(logging.getLogger(__name__))

    client.enable_logger(mqtt_logger)
    client.on_connect = on_connect
    client.on_message = on_message
    
    try:
        log_info(f"Connecting to MQTT broker at {MQTT_BROKER}:1883...")
        client.connect(MQTT_BROKER, 1883, 60)
         
        client.loop_forever()
        
    except Exception as e:
        log_error(f"MQTT connection failed: {e}")
        logging.exception("MQTT connection error")

if __name__ == "__main__":
    setup_mqtt()