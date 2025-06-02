import express from "express";

//import COntroller

import { register, getDeviceByGuid, getAllDevices, provision, updateDeviceStatus, revokeDevice, refreshDevicePairwiseKeys } from "../controllers/device.controller.js";
import authMiddlware from "../middleware/auth.middleware.js";

const router = express.Router();


router.get('/getAll', authMiddlware, getAllDevices);

router.get('/:deviceGuid/get', authMiddlware, getDeviceByGuid);


//provision
router.post('/:deviceGuid/provision', authMiddlware, provision);
//revockation
router.post('/:deviceGuid/revoke', authMiddlware, revokeDevice);
//rotation
router.post("/:deviceGuid/refresh-pairwise", authMiddlware, refreshDevicePairwiseKeys);


//status update
router.patch('/:deviceGuid', updateDeviceStatus);



router.post('/register', authMiddlware, register);




export default router;
