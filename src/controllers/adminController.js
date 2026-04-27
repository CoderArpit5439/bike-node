const asyncHandler = require("../utils/asyncHandler");
const adminService = require("../services/adminService");

const createScso = asyncHandler(async (req, res) => {
  const id = await adminService.createScso(req.body, req.user.id);
  res.status(201).json({ success: true, message: "SCSO created successfully", data: { id } });
});

const listScso = asyncHandler(async (req, res) => {
  const data = await adminService.listScso(req.query);
  res.json({ success: true, data });
});

const updateScso = asyncHandler(async (req, res) => {
  await adminService.updateScso(req.params.id, req.body);
  res.json({ success: true, message: "SCSO updated successfully" });
});

const toggleScsoStatus = asyncHandler(async (req, res) => {
  const status = await adminService.toggleScsoStatus(req.params.id);
  res.json({ success: true, message: `SCSO ${status} successfully`, data: { status } });
});

const listCustomers = asyncHandler(async (req, res) => {
  const data = await adminService.listAllCustomers(req.query);
  res.json({ success: true, data });
});

const getDashboard = asyncHandler(async (_req, res) => {
  const data = await adminService.getDashboardAnalytics();
  res.json({ success: true, data });
});

module.exports = {
  createScso,
  listScso,
  updateScso,
  toggleScsoStatus,
  listCustomers,
  getDashboard
};
