import express from "express";

import { Authenticate, register, getAll, getGatewayTask  , deleteGateway } from "../controllers/gateway.controller.js"
import authMiddlware from "../middleware/auth.middleware.js";


const router = express.Router();


//gateway side
router.post("/verify-gateway", Authenticate);

router.post("/create", authMiddlware, register);

//client side
router.get("/all", authMiddlware, getAll);


router.delete("/:id/delete" , authMiddlware , deleteGateway);   


//pool gateway Taks from gateway
router.get('/:gatewayGuid/task', getGatewayTask);

export default router; 