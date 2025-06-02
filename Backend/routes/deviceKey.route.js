import express from "express";

//import COntroller


import { createDeviceKey , getDeviceKeys , updateDeviceKeyRefreshStatus } from "../controllers/deviceKey.controller.js";

import authMiddlware from "../middleware/auth.middleware.js";

const router = express.Router();



router.get('/getAll', authMiddlware, getDeviceKeys);


router.post('/create', createDeviceKey);
//device-key


router.patch("/refresh-status",updateDeviceKeyRefreshStatus);

export default router;