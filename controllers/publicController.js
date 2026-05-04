import asyncHandler from "../utils/asyncHandler.js";
import publicService from "../services/publicService.js";

export const getBootstrap = asyncHandler(async (_req, res) => {
  const data = await publicService.getPublicBootstrap();
  res.json({ success: true, data });
});

export const submitContactForm = asyncHandler(async (req, res) => {
  await publicService.submitContactMessage(req.body);
  res.status(201).json({ success: true, message: "Message submitted successfully" });
});
