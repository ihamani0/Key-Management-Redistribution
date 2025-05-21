import express from "express";

//import COntroller

import { register, getDeviceByGuid, getAllDevices, provision, updateDeviceStatus } from "../controllers/device.controller.js";
import authMiddlware from "../middleware/auth.middleware.js";

const router = express.Router();


router.get('/getAll', authMiddlware, getAllDevices);

router.get('/:deviceGuid/get', authMiddlware, getDeviceByGuid);

router.post('/:deviceGuid/provision', authMiddlware, provision);


router.patch('/:deviceGuid', updateDeviceStatus);



router.post('/register', authMiddlware, register);




export default router;
