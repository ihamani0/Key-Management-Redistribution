# device_subscriber.py

import paho.mqtt.client as mqtt # mqtt.CallbackAPIVersion will be available here
import os
import json
import logging

# Enable detailed logging
logging.basicConfig(level=logging.DEBUG)

# Environment variables
DEVICE_GUID = os.getenv("DEVICE_GUID", "1.01")
SUBSET_GUID = os.getenv("SUBSET_IDENTIFIER", "LR01") # Not used in current script logic, but defined
MQTT_BROKER = os.getenv("MQTT_BROKER_URL", "mqtt-broker")

# Topics


CONFIG_TOPIC_SUBSCRIBE = f"iot_network/+/devices/{DEVICE_GUID}/config"

STATUS_TOPIC_TEMPLATE = "iot_network/{gateway_guid}/devices/{device_guid}/status"



discovered_gateway_guid = None

def on_connect(client, userdata, flags, rc, properties=None): 
    if rc == 0:
        print(f"[Device {DEVICE_GUID}] Connected to MQTT broker (code={rc})")
        # Subscribe to its specific config topic
        print(f"[Device {DEVICE_GUID}] Subscribing to config topic: {CONFIG_TOPIC_SUBSCRIBE}")
        client.subscribe(CONFIG_TOPIC_SUBSCRIBE, qos=1)

    else:
        print(f"[Device {DEVICE_GUID}] Connection failed with code {rc}")


def on_message(client, userdata, msg):

    global discovered_gateway_guid

    print(f"[Device {DEVICE_GUID}] Received message on topic: {msg.topic}")

    if f"/devices/{DEVICE_GUID}/config" in msg.topic:
        print(f"[Device {DEVICE_GUID}] Received provisioning data on {msg.topic}:")
        try:
            payload = json.loads(msg.payload)
            

            # Extract gateway_guid from the topic
            # Topic format: iot_network/<gateway_guid>/devices/<device_guid>/config
            topic_parts = msg.topic.split('/')


            if len(topic_parts) >= 2:
                discovered_gateway_guid = topic_parts[1] # The second part is the gateway_guid
                print(f"[Device {DEVICE_GUID}] Config received from gateway: {discovered_gateway_guid}")

                # Now construct the specific status topic to publish to
                status_publish_topic = STATUS_TOPIC_TEMPLATE.format(
                    gateway_guid=discovered_gateway_guid,
                    device_guid=DEVICE_GUID
                )
                print(f"[Device {DEVICE_GUID}] Publishing status to: {status_publish_topic}")

                client.publish(status_publish_topic, json.dumps({
                    "deviceGuid": DEVICE_GUID,
                    "status": "provisioned",
                    "taskId": payload.get("taskId"), # Include taskId if present in config
                    "timestamp": "NOW" # In a real app, use a proper timestamp
                }), qos=1)
            else:
                print(f"[Device {DEVICE_GUID}] Error: Could not extract gateway_guid from topic {msg.topic}")

        except Exception as e:
            print(f"[Device {DEVICE_GUID}] Error processing config payload: {e}")



# MQTT Setup
client = mqtt.Client(
    client_id=DEVICE_GUID,
    protocol=mqtt.MQTTv311,
    callback_api_version=mqtt.CallbackAPIVersion.VERSION1 # Use the enum
)
client.enable_logger(logging.getLogger(__name__))

client.on_connect = on_connect
client.on_message = on_message

# Connect to broker
try:
    print(f"[Device {DEVICE_GUID}] Attempting to connect to broker at {MQTT_BROKER}:1883")
    client.connect(MQTT_BROKER, 1883, 60) # Added keepalive=60
    print(f"[Device {DEVICE_GUID}] Starting MQTT loop...")
    client.loop_forever()
except Exception as e:
    print(f"🚨 MQTT connection failed for device {DEVICE_GUID}: {e}")
    logging.exception(f"Detailed MQTT connection error for device {DEVICE_GUID}:")