import asyncHandler from "../utils/asyncHandler.js";
import serviceService from "../services/serviceService.js";

export const createService = asyncHandler(async (req, res) => {
  const id = await serviceService.createService(req.user.id, req.body);
  res.status(201).json({ success: true, message: "Service created successfully", data: { id } });
});

export const listServices = asyncHandler(async (req, res) => {
  const data = await serviceService.listServices(req.user.id, req.query);
  res.json({ success: true, data });
});

export const updateService = asyncHandler(async (req, res) => {
  await serviceService.updateService(req.user.id, req.params.id, req.body);
  res.json({ success: true, message: "Service updated successfully" });
});

export const deleteService = asyncHandler(async (req, res) => {
  await serviceService.deleteService(req.user.id, req.params.id);
  res.json({ success: true, message: "Service deleted successfully" });
});
