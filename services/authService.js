const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const ApiError = require("../utils/apiError");
const { StatusCodes } = require("http-status-codes");
const { signToken } = require("../utils/jwt");

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  shopName: user.shop_name,
  shopAddress: user.shop_address,
  whatsappNumber: user.whatsapp_number,
  role: user.role,
  status: user.status,
  createdAt: user.created_at
});

const adminLogin = async ({ email, password }) => {
  const [rows] = await pool.query("SELECT * FROM admins WHERE email = ? LIMIT 1", [email]);
  const admin = rows[0];

  if (!admin) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid admin credentials");
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid admin credentials");
  }

  return {
    token: signToken({ id: admin.id, role: "admin" }),
    user: sanitizeUser(admin)
  };
};

const scsoLogin = async ({ email, password }) => {
  const [rows] = await pool.query("SELECT * FROM scso_users WHERE email = ? LIMIT 1", [email]);
  const user = rows[0];

  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  if (user.status !== "active") {
    throw new ApiError(StatusCodes.FORBIDDEN, "Account is inactive");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  return {
    token: signToken({ id: user.id, role: "scso" }),
    user: sanitizeUser(user)
  };
};

const scsoSignup = async ({ name, email, phone, password, shopName, shopAddress, whatsappNumber }) => {
  const [existing] = await pool.query("SELECT id FROM scso_users WHERE email = ? LIMIT 1", [email]);
  if (existing.length) {
    throw new ApiError(StatusCodes.CONFLICT, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    `INSERT INTO scso_users (name, email, phone, password, shop_name, shop_address, whatsapp_number)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, email, phone, hashedPassword, shopName, shopAddress || null, whatsappNumber || null]
  );

  const [rows] = await pool.query("SELECT * FROM scso_users WHERE id = ? LIMIT 1", [result.insertId]);
  const user = rows[0];

  return {
    token: signToken({ id: user.id, role: "scso" }),
    user: sanitizeUser(user)
  };
};

module.exports = {
  adminLogin,
  scsoLogin,
  scsoSignup
};
