import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateToken = (payload) => {
  return jwt.sign(
    payload, // Payload: typically contains user identifier
    process.env.SECRET_JWT,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    } // Your secret key from .env
  );
};
