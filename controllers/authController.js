const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/authService");

const adminLogin = asyncHandler(async (req, res) => {
  const data = await authService.adminLogin(req.body);
  res.json({ success: true, message: "Admin logged in successfully", data });
});

const scsoSignup = asyncHandler(async (req, res) => {
  const data = await authService.scsoSignup(req.body);
  res.status(201).json({ success: true, message: "Account created successfully", data });
});

const scsoLogin = asyncHandler(async (req, res) => {
  const data = await authService.scsoLogin(req.body);
  res.json({ success: true, message: "Logged in successfully", data });
});

const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

module.exports = {
  adminLogin,
  scsoSignup,
  scsoLogin,
  getProfile
};
