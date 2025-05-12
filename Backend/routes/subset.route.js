import express from "express";

import { create, retriveAll } from "../controllers/subset.controller.js"
import authMiddlware from "../middleware/auth.middleware.js";


const router = express.Router();


// Create a new Subset
router.post("/create", authMiddlware, create);
// retrive all subset
router.get("/all", authMiddlware, retriveAll);

export default router; 