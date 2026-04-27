const asyncHandler = require("../utils/asyncHandler");
const publicService = require("../services/publicService");

const getBootstrap = asyncHandler(async (_req, res) => {
  const data = await publicService.getPublicBootstrap();
  res.json({ success: true, data });
});

const submitContactForm = asyncHandler(async (req, res) => {
  await publicService.submitContactMessage(req.body);
  res.status(201).json({ success: true, message: "Message submitted successfully" });
});

module.exports = {
  getBootstrap,
  submitContactForm
};
