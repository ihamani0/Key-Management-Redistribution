import express from "express";

import { getAllTask, updateTask , scheduleKeyRefresh } from "../controllers/task.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";


const router = express.Router();

router.get('/getAll', authMiddleware, getAllTask);

router.patch('/:taskId', updateTask);


router.post("/schedule-key-refresh", authMiddleware, scheduleKeyRefresh);

export default router; 