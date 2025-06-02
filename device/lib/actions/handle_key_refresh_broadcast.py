import json
import time
from lib.log_handler import log_info, log_key_mgmt, log_warning, log_error

import lib.shared_state
from lib.shared_state import device 

from lib.config import DEVICE_GUID, STATUS_TOPIC_TEMPLATE



def handle_key_refresh_broadcast(client, msg_payload):
    try:
        data = json.loads(msg_payload.decode('utf-8'))
        
        if data['type'] != "SCHEDULED_KEY_REFRESH":
            return
            
        refresh_nonce = data.get("refreshNonce")
        issuer = data.get("issuer")
        task_id = data.get("taskId")
        
        if not refresh_nonce:
            log_warning("Received key refresh broadcast without nonce")
            return
            
        log_key_mgmt(f"Received scheduled key refresh broadcast (Nonce: {refresh_nonce[:14]}...)")
        
        # Refresh all pairwise keys
        keys_refreshed = device.refresh_all_pairwise_keys(refresh_nonce)
        
        # Send acknowledgment
        if lib.shared_state.discovered_gateway_guid:
            ack_payload = {
                "deviceGuid": DEVICE_GUID,
                "status_type": "scheduled_key_refresh_completed",
                "taskId": task_id,
                "timestamp": time.time(),
                "keysRefreshedCount": keys_refreshed,
                "issuer": issuer
            }
            
            status_topic = STATUS_TOPIC_TEMPLATE.format(
                gateway_guid=lib.shared_state.discovered_gateway_guid,
                device_guid=DEVICE_GUID
            )
            
            client.publish(status_topic, json.dumps(ack_payload), qos=1)
            log_info(f"Sent key refresh ACK for task {task_id}")
    except Exception as e:
        log_error(f"Error handling key refresh broadcast: {e}")