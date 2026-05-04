import { validationResult } from "express-validator";
import ApiError from "./apiError.js";

export const validate = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new ApiError(422, errors.array()[0].msg));
  }

  next();
};
