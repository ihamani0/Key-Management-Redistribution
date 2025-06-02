# Security helpers

import hashlib
import hmac
import secrets
import time
import threading

def generate_nonce():
    """Generate cryptographically secure nonce"""
    return f"NONCE_{secrets.token_hex(8)}"

def compute_discovery_digest(secret_i, device_guid, nonce):
    """HMAC for discovery messages"""
    return hmac.new(
        secret_i.encode(),
        f"{device_guid}{nonce}".encode(),
        hashlib.sha256
    ).hexdigest()

def compute_pairwise_digest(key, nonce):
    """HMAC for pairwise key verification"""
    return hmac.new(
        key.encode(),
        nonce.encode(),
        hashlib.sha256
    ).hexdigest()

def hash_key(key):
    """SHA-256 for key fingerprints"""
    return hashlib.sha256(key.encode()).hexdigest()

def secure_erase(data):
    """Overwrite memory after use"""
    if isinstance(data, bytearray):
        data[:] = b'\0' * len(data)
    elif isinstance(data, str):
        data = '0' * len(data)

def start_periodic_task(interval, task):
    """Helper for periodic tasks"""
    def loop():
        task()
        threading.Timer(interval, loop).start()
    
    loop()


def get_sorted_guids(guid1, guid2):
    # Assumes GUID format like "somename@1", "somename@2", etc.
    # Extracts the numeric part after the "@" for sorting.
    def get_numeric_part(guid_string):
        try:
            return int(guid_string.split('@')[-1])
        except (ValueError, IndexError):
            # Fallback if format is unexpected, sort alphabetically as strings
            print(f"[WARN] Could not extract numeric part from GUID for sorting: {guid_string}. Using string sort.")
            return guid_string # Fallback to string comparison for that element

    return sorted((guid1, guid2), key=get_numeric_part)

def hash_key(key):
    """SHA-256 for key fingerprints"""
    return hashlib.sha256(key.encode()).hexdigest()