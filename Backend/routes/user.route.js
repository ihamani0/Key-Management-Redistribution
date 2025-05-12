import express from "express";
import { userDetails } from "../controllers/user.controller.js";
import authMiddlware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/me", authMiddlware, userDetails);

export default router; 