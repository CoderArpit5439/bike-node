import asyncHandler from "../utils/asyncHandler.js";
import adminService from "../services/adminService.js";

export const createScso = asyncHandler(async (req, res) => {
  const id = await adminService.createScso(req.body, req.user.id);
  res.status(201).json({ success: true, message: "SCSO created successfully", data: { id } });
});

export const listScso = asyncHandler(async (req, res) => {
  const data = await adminService.listScso(req.query);
  res.json({ success: true, data });
});

export const updateScso = asyncHandler(async (req, res) => {
  await adminService.updateScso(req.params.id, req.body);
  res.json({ success: true, message: "SCSO updated successfully" });
});

export const toggleScsoStatus = asyncHandler(async (req, res) => {
  const status = await adminService.toggleScsoStatus(req.params.id);
  res.json({ success: true, message: `SCSO ${status} successfully`, data: { status } });
});

export const listCustomers = asyncHandler(async (req, res) => {
  const data = await adminService.listAllCustomers(req.query);
  res.json({ success: true, data });
});

export const getDashboard = asyncHandler(async (_req, res) => {
  const data = await adminService.getDashboardAnalytics();
  res.json({ success: true, data });
});
