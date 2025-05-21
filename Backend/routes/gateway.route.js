import express from "express";

import { Authenticate, register, getAll, getGatewayTask } from "../controllers/gateway.controller.js"
import authMiddlware from "../middleware/auth.middleware.js";


const router = express.Router();


//gateway side
router.post("/verify-gateway", Authenticate);
router.post("/register", register);

//client side
router.get("/getAll", authMiddlware, getAll);


//pool gateway Taks
router.get('/:gatewayGuid/task', getGatewayTask);

export default router; 