import json

from lib.shared_state import reported_key_establishment , device 
from lib.config import *
from lib.log_handler import log_revocation, log_error


def handle_revocation_alert(client, msg_payload):
    try:
        alert_data = json.loads(msg_payload.decode('utf-8'))
        
        if alert_data.get("type") == "REVOCATION_ALERT":
            revoked_guid = alert_data.get("revokedGuid")
            issuer_guid = alert_data.get("issuer")

            if not revoked_guid:
                log_error("Received incomplete revocation alert")
                return
            
            # Immediately blacklist this GUID
            device.add_to_revoked_list(revoked_guid)
            
            log_revocation(f"Device {revoked_guid} has been revoked by {issuer_guid}")

            # Check if we are the revoked device
            if revoked_guid == DEVICE_GUID:
                device.set_device_revoked(True)
                log_revocation(f"⚠️  THIS DEVICE has been revoked by {issuer_guid}")
                return

            # Delete pairwise key with revoked device
            if revoked_guid in device.evkms_state["pairwise_keys"]:
                del device.evkms_state["pairwise_keys"][revoked_guid]
                log_revocation(f"Deleted pairwise key with revoked device {revoked_guid}")

                # Clear reporting status
                if revoked_guid in reported_key_establishment:
                    del reported_key_establishment[revoked_guid]
                    log_revocation(f"Cleared reporting status for {revoked_guid}")


            else:
                log_revocation(f"No pairwise key found for {revoked_guid} (already cleaned)")
                
        else:
            log_error(f"Received unknown alert type: {alert_data.get('type')}")

    except json.JSONDecodeError:
        log_error("Received non-JSON message on revocation alert topic")
    except Exception as e:
        log_error(f"Error processing revocation alert: {e}")
        import traceback
        traceback.print_exc()