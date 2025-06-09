import express from "express";

import { getAllTask, updateTask , scheduleKeyRefresh } from "../controllers/task.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";


const router = express.Router();

router.get('/all', authMiddleware, getAllTask);



router.post("/schedule", authMiddleware, scheduleKeyRefresh);


router.patch('/:taskId', updateTask);


export default router; 