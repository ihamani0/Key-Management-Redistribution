import json
import time
from lib.log_handler import log_info, log_key_mgmt, log_warning, log_error

import lib.shared_state
from lib.shared_state import device  

from lib.config import DEVICE_GUID, STATUS_TOPIC_TEMPLATE

def handle_refresh_command(client, msg_payload):
    
    if device.is_this_device_revoked():
        log_warning("Device is revoked, ignoring refresh command.")
        return
    

    try:
        command_data = json.loads(msg_payload.decode('utf-8'))
        
        refresh_nonce = command_data.get("refreshNonce")
        issuer_guid = command_data.get("issuer")
        task_id = command_data.get("taskId")

        command_type = command_data.get("type")

        keys_refreshed = 0


        if command_type == "REFRESH_ALL_RELATED_PAIRWISE_KEYS":
            # This is for the central device (A) initiating the refresh
            
            log_key_mgmt(f"Received command to refresh ALL related pairwise keys (Nonce: {refresh_nonce[:14]}...)")
            
            keys_refreshed = device.refresh_all_pairwise_keys(refresh_nonce)  # all device have pairways key with a
            # Uses refresh_all_pairwise_keys in evkms_core

        elif command_type == "REFRESH_SPECIFIC_PAIRWISE_KEY":

            target_peer_guid_in_command = command_data.get("targetPeerGuid") # device only one have pairways key with a 

            if not target_peer_guid_in_command:
                log_error("Refresh command for specific key received without targetPeerGuid.")
                return


            log_key_mgmt(f"Received command to refresh key with specific peer {target_peer_guid_in_command} (Nonce: {refresh_nonce[:14]}...)")
            
            keys_refreshed = device.refresh_pairwise_key_with_peer(target_peer_guid_in_command, refresh_nonce)


        else:
            log_warning(f"Received unknown refresh command type: {command_type}")
            return
        


        if lib.shared_state.discovered_gateway_guid:
            
            ack_payload = {
                "deviceGuid": DEVICE_GUID, # A || B 
                "status_type": "pairwise_key_refresh_processed",
                "taskId": task_id,
                "timestamp": time.time(),
                "peerKeysRefreshedCount": keys_refreshed, # Corrected to show actual count

                "refreshedPeerGuid": command_data.get("targetPeerGuid"),
                "wasCentralRefresh": command_type == "REFRESH_ALL_RELATED_PAIRWISE_KEYS"
            }
            
            status_topic = STATUS_TOPIC_TEMPLATE.format(gateway_guid=lib.shared_state.discovered_gateway_guid, device_guid=DEVICE_GUID)
            
            client.publish(status_topic, json.dumps(ack_payload), qos=1)
            
            log_info(f"Sent pairwise key refresh ACK to gateway for task {task_id}")
        else:
            log_warning("Discovered gateway GUID not set, cannot send refresh ACK.")

    
    except json.JSONDecodeError as e:
        log_error("Received non-JSON message on command topic")
    except Exception as e:
        log_error(f"Error handling refresh command: {e}")
        import traceback
        traceback.print_exc()