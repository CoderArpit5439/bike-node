import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import adminRepository from "../repositories/admin.repository.js";
import scsoUserRepository from "../repositories/scsoUser.repository.js";
import ApiError from "../utils/apiError.js";

export const authMiddleware = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required"));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user =
      decoded.role === "admin"
        ? await adminRepository.findByIdForAuth(decoded.id)
        : await scsoUserRepository.findByIdForAuth(decoded.id);

    if (!user || user.status !== "active") {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, "Account is inactive or missing"));
    }

    req.user = user;
    next();
  } catch (_error) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired token"));
  }
};

export const roleMiddleware = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(StatusCodes.FORBIDDEN, "You do not have permission"));
  }

  next();
};
