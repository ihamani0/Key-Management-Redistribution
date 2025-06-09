import express from "express";

import { create, retriveAll , deleteSubset } from "../controllers/subset.controller.js"
import authMiddlware from "../middleware/auth.middleware.js";


const router = express.Router();


// Create a new Subset
router.post("/create", authMiddlware, create);
// retrive all subset
router.get("/all", authMiddlware, retriveAll);

router.delete("/:id/delete", authMiddlware, deleteSubset )

export default router; 