import asyncHandler from "../utils/asyncHandler.js";
import settingService from "../services/settingService.js";

export const getSettings = asyncHandler(async (req, res) => {
  const data = await settingService.getSettings(req.user.id);
  res.json({ success: true, data });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const data = await settingService.updateSettings(req.user.id, req.body);
  res.json({ success: true, message: "Settings updated successfully", data });
});
