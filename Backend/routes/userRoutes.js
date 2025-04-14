import express from "express";
import { userDetails } from "../controllers/UserController.js";
import authMiddlware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authMiddlware, userDetails);

export default router ; 