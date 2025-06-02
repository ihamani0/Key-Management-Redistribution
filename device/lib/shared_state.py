
from lib.evkms_core import EVKMSDevice
from lib.config import *


is_this_device_revoked = {"value": False}


reported_key_establishment = {}


discovered_gateway_guid = None


device = EVKMSDevice(DEVICE_GUID, SUBSET_GUID)
