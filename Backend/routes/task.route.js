import express from "express";

import { getAllTask, updateTask } from "../controllers/task.controller.js";

import authMiddlware from "../middleware/auth.middleware.js";


const router = express.Router();

router.get('/getAll', authMiddlware, getAllTask);

router.patch('/:taskId', updateTask);


export default router; 