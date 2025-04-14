import { validationResult } from "express-validator";

export const validateRequest = (req, res, next) => {
  const Errors = validationResult(req);

  if (Errors.isEmpty()) {
    // If no errors, proceed to the next middleware or route handler.
    return next();
  }
  // If ther errors, proceed to error hanedler middleware .
  const err = new Error("Validation Error");
  err.status = Errors.array();
  err.statusCode = 401;

  next(err);
};
