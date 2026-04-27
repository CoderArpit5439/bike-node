const asyncHandler = require("../utils/asyncHandler");
const recordService = require("../services/recordService");

const getDashboard = asyncHandler(async (req, res) => {
  const data = await recordService.getScsoDashboard(req.user.id);
  res.json({ success: true, data });
});

const createRecord = asyncHandler(async (req, res) => {
  const id = await recordService.createServiceRecord(req.user.id, req.body);
  res.status(201).json({ success: true, message: "Job card created successfully", data: { id } });
});

const listRecords = asyncHandler(async (req, res) => {
  const data = await recordService.listServiceRecords(req.user.id);
  res.json({ success: true, data });
});

const getRecordDetail = asyncHandler(async (req, res) => {
  const data = await recordService.getServiceRecordDetail(req.user.id, req.params.id);
  res.json({ success: true, data });
});

module.exports = {
  getDashboard,
  createRecord,
  listRecords,
  getRecordDetail
};
