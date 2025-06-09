import express from "express";

//import COntroller

import { register, getDeviceByGuid, getAllDevices, provision, updateDeviceStatus, revokeDevice, refreshDevicePairwiseKeys ,deleteDevice, getDevicesBySubset} from "../controllers/device.controller.js";
import authMiddlware from "../middleware/auth.middleware.js";

const router = express.Router();


router.get('/all', authMiddlware, getAllDevices);
router.post('/create', authMiddlware, register);
router.delete("/:id/delete" , authMiddlware, deleteDevice);


router.get('/:deviceGuid/get', authMiddlware, getDeviceByGuid);


//provision
router.post('/:deviceGuid/provision', authMiddlware, provision);
//revockation
router.post('/:deviceGuid/revoke', authMiddlware, revokeDevice);
//rotation
router.post("/:deviceGuid/refresh-pairwise", authMiddlware, refreshDevicePairwiseKeys);


//status update
router.patch('/:deviceGuid', updateDeviceStatus);


//fetech device by subaria
router.get('/:subsetId/subset', authMiddlware , getDevicesBySubset);




export default router;
