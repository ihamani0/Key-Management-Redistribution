
from lib.config import *


def log_revocation(message):
    """Revocation-specific logging"""
    print(f"\033[95m[{DEVICE_GUID}] REVOCATION: {message}\033[0m")


def log_info(message):
    """Clean info logging with device ID"""
    print(f"\033[92m[{DEVICE_GUID}] {message}\033[0m")

def log_warning(message):
    """Clean warning logging with device ID"""
    print(f"\033[93m[{DEVICE_GUID}] WARNING: {message}\033[0m")

def log_error(message):
    """Clean error logging with device ID"""
    print(f"\033[91m[{DEVICE_GUID}] ERROR: {message}\033[0m")

def log_discovery(message):
    """Discovery-specific logging"""
    print(f"\033[94m[{DEVICE_GUID}] DISCOVERY: {message}\033[0m")

def log_key_mgmt(message):
    """Key management logging"""
    print(f"\033[96m[{DEVICE_GUID}] KEY_MGMT: {message}\033[0m")    