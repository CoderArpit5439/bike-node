import asyncHandler from "../utils/asyncHandler.js";
import recordService from "../services/recordService.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const data = await recordService.getScsoDashboard(req.user.id);
  res.json({ success: true, data });
});

export const createRecord = asyncHandler(async (req, res) => {
  const id = await recordService.createServiceRecord(req.user.id, req.body);
  res.status(201).json({ success: true, message: "Job card created successfully", data: { id } });
});

export const listRecords = asyncHandler(async (req, res) => {
  const data = await recordService.listServiceRecords(req.user.id, req.query);
  res.json({ success: true, data });
});

export const getRecordDetail = asyncHandler(async (req, res) => {
  const data = await recordService.getServiceRecordDetail(req.user.id, req.params.id);
  res.json({ success: true, data });
});
