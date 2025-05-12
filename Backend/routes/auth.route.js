import express from "express";

import {
  loginController,
  registerController,
  checkAuthController,
  LogoutController
} from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { body } from "express-validator";
import { validateRequest } from "../utils/validateRequest.js";

const router = express.Router();

const validateCreadentialLogin = [
  body("email")
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),
  ,
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 4 characters long"),
];

const validateCreadentialRegister = [
  body("name").isString().isLength({ min: 4 }),
  body("email")
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),
  ,
  body("password")
    .isLength({ min: 1 })
    .withMessage("Password must be at least 5 characters long"),
];

router.post(
  "/login",
  validateCreadentialLogin,
  validateRequest,
  loginController
);
router.post(
  "/register",
  validateCreadentialRegister,
  validateRequest,
  registerController
);

router.get('/checkAuth', authMiddleware, checkAuthController)
router.get('/logout', authMiddleware, LogoutController)

export default router;
