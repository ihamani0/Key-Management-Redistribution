# EVKMS vector math + key derivation

import json
import hashlib
import time
from lib.utils import generate_nonce, compute_pairwise_digest, hash_key , get_sorted_guids

from lib.log_handler import log_info, log_key_mgmt, log_warning, log_error


class EVKMSDevice:
    def __init__(self, device_guid, subset_guid):
        self.device_guid = device_guid
        self.subset_guid = subset_guid
        
        # Secure storage for EVKMS material
        self.evkms_state = {
            "secret_i": None,
            "vector_Vp": [],  # Previous subset secrets
            "vector_Vc": [],  # Current subset secrets
            "vector_Vn": [],  # Next subset secrets
            "alpha": 5,       # Security parameter α
            "local_id": None,  # Local identifier in subset
            "pairwise_keys": {} ,   # {neighbor_guid: {"key": ..., "nonce": ...}}
            # Track GUIDs revoked by this device or received via alerts
            "known_revoked_peers": set(),
            
        }
        self.is_revoked = False
    


    def load_evkms_payload(self, payload):
        """Load EVKMS vectors from provisioning payload"""
        self.evkms_state.update({
            "secret_i": payload["secret_i"],
            "vector_Vp": payload["Vectore_p"],
            "vector_Vc": payload["Vectore_c"],
            "vector_Vn": payload["Vectore_n"],
            "alpha": payload["alpha"],
            "local_id": self._extract_local_id()
        })
        print(f"\033[92m[INFO][EVKMS] Loaded provisioning data for {self.device_guid}\033[0m")
    
    def _extract_local_id(self):
        """Extract local ID from device GUID (e.g., 'subset1_device@05' → 'device@05')"""
        return self.device_guid.split("_")[-1]
    

    

    def add_to_revoked_list(self, revoked_guid):
        """Mark a peer as revoked so no further key exchanges occur"""
        self.evkms_state["known_revoked_peers"].add(revoked_guid)
        print(f"\033[91m[EVKMS_STATE][Device {self.device_guid}] Added {revoked_guid} to known_revoked_peers\033[0m")

    def is_peer_revoked(self, peer_guid):
        """Check whether a given peer GUID is in the revoked list"""
        return peer_guid in self.evkms_state.get("known_revoked_peers", set())

    

    def compute_pairwise_key(self, neighbor_guid, neighbor_secret, nonce):
        """EVKMS pairwise key derivation (Section 3.3.4)"""

        #Sorted the global uid and then compute the pairways 

        guid_a, guid_b = get_sorted_guids(self.device_guid , neighbor_guid )

        secret_a , secret_b = sorted([self.evkms_state['secret_i'] , neighbor_secret ])

        key_material = f"{guid_a}{guid_b}{nonce}{secret_a}{secret_b}"
        
        # PBKDF2-HMAC-SHA256 for key stretching
        return hashlib.pbkdf2_hmac(
            'sha256',
            key_material.encode(),
            nonce.encode(),
            100000  # Iterations
        ).hex()
    
    def store_pairwise_key(self, neighbor_guid, key, nonce ):
        """Securely store pairwise key in memory"""
        self.evkms_state["pairwise_keys"][neighbor_guid] = {
            "key": key,
            "nonce": nonce, # The discovery nonce that led to this key
            "timestamp": time.time(), # Use time from Python's time module
        }

        log_key_mgmt(f"Stored pairwise key with {neighbor_guid} (Nonce: {nonce[:14]}...)")



    def get_secret_from_vic(self, local_id):
        """Map neighbor GUID to Vc index"""
        try:
            index = int(local_id) - 1  # Convert "05" → index 4
            return self.evkms_state["vector_Vc"][index]
        except (ValueError, IndexError):
            return None
        
    

    def is_this_device_revoked(self) : 
        return self.is_revoked
    
    def set_device_revoked(self, revoked_status):
        """Set the device's revoked status"""
        self.is_revoked = revoked_status
        if revoked_status:
            log_warning(f"Device {self.device_guid} has been marked as revoked.")
        else:
            log_info(f"Device {self.device_guid} is no longer revoked.")



    def refresh_pairwise_key_with_peer(self, peer_guid_to_refresh, refresh_nonce): # <<< RENAMED & MODIFIED
        """
        Refreshes a specific pairwise key with a target peer using the provided refresh_nonce.
        K'ij = Hash(Kij, r)
        """
        keys_refreshed_count = 0
        
        # Check if the target peer's key exists
        key_info = self.evkms_state["pairwise_keys"].get(peer_guid_to_refresh)

        if key_info: # No 'verified' check due to simplification
            old_key_hex = key_info["key"]
            
            # New key material: hash of old key and the refresh_nonce
            new_key_material = f"{old_key_hex}{refresh_nonce}"
            new_key_hex = hashlib.sha256(new_key_material.encode('utf-8')).hexdigest()

            # Update the stored key
            self.evkms_state["pairwise_keys"][peer_guid_to_refresh]["key"] = new_key_hex
            self.evkms_state["pairwise_keys"][peer_guid_to_refresh]["timestamp"] = time.time() # Update timestamp

            keys_refreshed_count += 1
            log_info(f"Refreshed pairwise key with {peer_guid_to_refresh}. New hash: {hash_key(new_key_hex)[:10]}...")
        else:
            log_warning(f"Skipping refresh for {peer_guid_to_refresh} - key missing for this peer.")
        
        log_info(f"Total specific pairwise keys refreshed: {keys_refreshed_count}")
        return keys_refreshed_count

    # Optional: If you still need to refresh ALL keys (e.g. for a global reset)



    def refresh_all_pairwise_keys(self, refresh_nonce):
        """Refreshes ALL existing pairwise keys regardless of target_peer."""
        keys_refreshed_count = 0
        current_peers = list(self.evkms_state["pairwise_keys"].keys())
        for peer_guid in current_peers:
            # Re-use the specific refresh method
            if self.refresh_pairwise_key_with_peer(peer_guid, refresh_nonce) > 0:
                keys_refreshed_count += 1
        return keys_refreshed_count



