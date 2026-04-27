const asyncHandler = require("../utils/asyncHandler");
const settingService = require("../services/settingService");

const getSettings = asyncHandler(async (req, res) => {
  const data = await settingService.getSettings(req.user.id);
  res.json({ success: true, data });
});

const updateSettings = asyncHandler(async (req, res) => {
  await settingService.updateSettings(req.user.id, req.body);
  res.json({ success: true, message: "Settings updated successfully" });
});

module.exports = {
  getSettings,
  updateSettings
};
