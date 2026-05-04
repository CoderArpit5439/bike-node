import asyncHandler from "../utils/asyncHandler.js";
import reminderService from "../services/reminderService.js";

export const createReminder = asyncHandler(async (req, res) => {
  const id = await reminderService.createReminder(req.user.id, req.body);
  res.status(201).json({ success: true, message: "Reminder created successfully", data: { id } });
});

export const listReminders = asyncHandler(async (req, res) => {
  const data = await reminderService.listReminders(req.user.id, req.query);
  res.json({ success: true, data });
});

export const updateReminder = asyncHandler(async (req, res) => {
  await reminderService.updateReminder(req.user.id, req.params.id, req.body);
  res.json({ success: true, message: "Reminder updated successfully" });
});
