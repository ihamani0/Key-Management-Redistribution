import express from "express";

import { Authenticate, register, retriveAll } from "../controllers/gateway.controller.js"
import authMiddlware from "../middleware/auth.middleware.js";


const router = express.Router();


//gateway side
router.post("/verify-gateway", Authenticate);
router.post("/register", register);

//client side
router.get("/All", authMiddlware, retriveAll);

export default router; 