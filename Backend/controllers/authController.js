import bcrypt from "bcryptjs";
import { USER } from "../models/index.js";
import asyncHandler from "express-async-handler";
import { generateToken } from "../utils/generateToken.js";
import dotEnv from "dotenv";

dotEnv.config();

/**
 * @desc    Login a user and return a JWT and user data
 * @route   POST /api/login
 * @access  Public
 */
export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("Fill All The Field");
    error.status = "fail";
    error.statusCode = 400;
    throw error;
  }

  const user = await USER.findOne({ where: { email } });
  if (!user) {
    const error = new Error("Invalid email or password");
    error.status = "Unauthorized";
    error.statusCode = 401;
    throw error;
  }

  // Compare the provided password with the stored hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.status = "Unauthorized";
    error.statusCode = 401;
    throw error;
  }

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  res.cookie("authToken", generateToken(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.status(200).json({
    message: "User Login successfully!",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});

/**
 * @desc    Register a user and return a JWT and user data
 * @route   POST /api/register
 * @access  Public
 */
export const registerController = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  //validation

  const existsUser = await USER.findOne({ where: { email } });
  if (existsUser) {
    const error = new Error("A user already exists with this email.");
    error.statusCode = 400;
    error.status = "fail";
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await USER.create({
    name,
    email,
    password: passwordHash,
  });

  if (!newUser) {
    const error = new Error("Invalid user data");
    error.statusCode = 400;
    error.status = "fail";
    throw error;
  }

  const payload = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };

  res.cookie("authToken", generateToken(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.status(201).json({
    message: "User registered successfully!",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    },
  });
});

//1- validation input using validator and send generasteToken to the user
//understan async handler
//apply json

export const LogoutController = asyncHandler(async (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

export const checkAuthController = asyncHandler(async (req, res) => {
  const user = req.user;
  res.status(200).json({
    message: "The user is Authorized",
    user: {
      id: user.id,
      email: user.email,
    },
  });
});
