import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";

dotenv.config();

const authMiddlware = asyncHandler((req, res, next) => {
  // Extract the "Authorization" header value
  // const authHeader = req.headers.authorization;

  // if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //   const error = new Error("No token provided, authorization denied.");
  //   error.statusCode = 401;
  //   error.status = "No Authorized";
  //   throw error;
  // }


  //extract the token from bearer  example : bearer xbvnaxsad....
  // const token = authHeader.split(" ")[1];
  const token  = req.cookies.authToken;

  // Verify the token using your JWT_SECRET
  jwt.verify(token, process.env.SECRET_JWT, (error, decoded) => {
    if (error) {
      const error = new Error("invalid signature");
      error.statusCode = 403;
      error.status = "JsonWebTokenError";
      throw error;
    }

    // Attach the decoded user information to the request object for use in protected routes
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  });
});

export default authMiddlware;
