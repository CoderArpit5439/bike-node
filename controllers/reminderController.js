const asyncHandler = require("../utils/asyncHandler");
const reminderService = require("../services/reminderService");

const createReminder = asyncHandler(async (req, res) => {
  const id = await reminderService.createReminder(req.user.id, req.body);
  res.status(201).json({ success: true, message: "Reminder created successfully", data: { id } });
});

const listReminders = asyncHandler(async (req, res) => {
  const data = await reminderService.listReminders(req.user.id, req.query);
  res.json({ success: true, data });
});

const updateReminder = asyncHandler(async (req, res) => {
  await reminderService.updateReminder(req.user.id, req.params.id, req.body);
  res.json({ success: true, message: "Reminder updated successfully" });
});

module.exports = {
  createReminder,
  listReminders,
  updateReminder
};
