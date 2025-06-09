import express from "express";


import { getAuditLogs } from "../controllers/auditLog.controller.js";
import authMiddlware from "../middleware/auth.middleware.js";

const router = express.Router();



router.get('/logs', authMiddlware, getAuditLogs);

export default router;