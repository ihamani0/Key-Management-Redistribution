import os
import logging

from lib.mqtt_handler import setup_mqtt


# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(message)s'
)

if __name__ == "__main__":
    print(f"Starting IoT Device {os.getenv('DEVICE_GUID', 'subset1_device1')}")
    setup_mqtt()