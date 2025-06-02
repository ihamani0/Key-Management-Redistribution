# Environment config

import os

# Device identity
DEVICE_GUID = os.getenv("DEVICE_GUID", "subset1_device@1")
SUBSET_GUID = os.getenv("SUBSET_IDENTIFIER", "LR01")
MQTT_BROKER = os.getenv("MQTT_BROKER_URL", "mqtt-broker")



# MQTT Topics
BROADCAST_TOPIC = "iot_network/broadcast/discovery"

CONFIG_TOPIC_TEMPLATE = "iot_network/+/devices/{device_guid}/config"
COMMAND_TOPIC_TEMPLATE = "iot_network/+/devices/{device_guid}/commands"

STATUS_TOPIC_TEMPLATE = "iot_network/{gateway_guid}/devices/{device_guid}/status"




DISCOVERY_TOPIC = "iot_network/subsets/{subset_guid}/discovery"
 
SUBSET_ALERT_TOPIC="iot_network/subsets/{subset_guid}/broadcast_alerts"



# Targeted response topic for key acknowledgment
KEY_RESPONSE_TOPIC = "iot_network/devices/{target_guid}/key_response"