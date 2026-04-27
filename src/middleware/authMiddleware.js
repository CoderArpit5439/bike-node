const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const ApiError = require("../utils/apiError");
const { pool } = require("../config/db");

const authMiddleware = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required"));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;

    if (decoded.role === "admin") {
      const [rows] = await pool.query(
        "SELECT id, name, email, role, status, created_at FROM admins WHERE id = ? LIMIT 1",
        [decoded.id]
      );
      user = rows[0];
    } else {
      const [rows] = await pool.query(
        "SELECT id, name, email, phone, shop_name, role, status, created_at FROM scso_users WHERE id = ? LIMIT 1",
        [decoded.id]
      );
      user = rows[0];
    }

    if (!user || user.status !== "active") {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, "Account is inactive or missing"));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired token"));
  }
};

const roleMiddleware = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(StatusCodes.FORBIDDEN, "You do not have permission"));
  }

  next();
};

module.exports = {
  authMiddleware,
  roleMiddleware
};
