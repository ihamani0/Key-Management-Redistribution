import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";

import db from '../models/index.js'

const {sequelize} = db ;

dotenv.config();

const authMiddlware = asyncHandler(async (req, res, next) => {


  //extract the token from bearer  example : bearer xbvnaxsad....

  const token  = req.cookies.authToken;

  if (!token) {
    const error = new Error("No token provided, authorization denied.");
    error.statusCode = 401;
    error.status = "No Authorized";
    throw error;
  }


  let decoded;

  try {
    decoded = jwt.verify(token, process.env.SECRET_JWT);
  } catch (err) {
    const error = new Error("invalid signature");
    error.statusCode = 403;
    error.status = "JsonWebTokenError";
    throw error;
  }


  req.user = decoded;


  await sequelize.query("SET app.current_user_id = :userId", {
    replacements: { userId: req.user.id }
  });

  next();

  

});

export default authMiddlware;
