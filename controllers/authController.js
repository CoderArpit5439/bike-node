import asyncHandler from "../utils/asyncHandler.js";
import authService from "../services/authService.js";

export const adminLogin = asyncHandler(async (req, res) => {
  const data = await authService.adminLogin(req.body);
  res.json({ success: true, message: "Admin logged in successfully", data });
});

export const scsoSignup = asyncHandler(async (req, res) => {
  const data = await authService.scsoSignup(req.body);
  res.status(201).json({ success: true, message: "Account created successfully", data });
});

export const scsoLogin = asyncHandler(async (req, res) => {
  const data = await authService.scsoLogin(req.body);
  res.json({ success: true, message: "Logged in successfully", data });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});
