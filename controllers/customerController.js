import asyncHandler from "../utils/asyncHandler.js";
import customerService from "../services/customerService.js";

export const addBike = asyncHandler(async (req, res) => {
  const id = await customerService.addBike(req.user.id, req.params.id, req.body);
  res.status(201).json({ success: true, message: "Bike added successfully", data: { id } });
});

export const createCustomer = asyncHandler(async (req, res) => {
  const id = await customerService.createCustomer(req.user.id, req.body);
  res.status(201).json({ success: true, message: "Customer created successfully", data: { id } });
});

export const listCustomers = asyncHandler(async (req, res) => {
  const data = await customerService.listCustomers(req.user.id, req.query);
  res.json({ success: true, data });
});

export const getCustomerDetails = asyncHandler(async (req, res) => {
  const data = await customerService.getCustomerDetails(req.user.id, req.params.id);
  res.json({ success: true, data });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  await customerService.updateCustomer(req.user.id, req.params.id, req.body);
  res.json({ success: true, message: "Customer updated successfully" });
});

export const getWalletSummary = asyncHandler(async (req, res) => {
  const data = await customerService.getWalletSummary(req.user.id, req.params.id);
  res.json({ success: true, data });
});
