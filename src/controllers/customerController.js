const asyncHandler = require("../utils/asyncHandler");
const customerService = require("../services/customerService");

const createCustomer = asyncHandler(async (req, res) => {
  const id = await customerService.createCustomer(req.user.id, req.body);
  res.status(201).json({ success: true, message: "Customer created successfully", data: { id } });
});

const listCustomers = asyncHandler(async (req, res) => {
  const data = await customerService.listCustomers(req.user.id, req.query);
  res.json({ success: true, data });
});

const getCustomerDetails = asyncHandler(async (req, res) => {
  const data = await customerService.getCustomerDetails(req.user.id, req.params.id);
  res.json({ success: true, data });
});

const updateCustomer = asyncHandler(async (req, res) => {
  await customerService.updateCustomer(req.user.id, req.params.id, req.body);
  res.json({ success: true, message: "Customer updated successfully" });
});

const getWalletSummary = asyncHandler(async (req, res) => {
  const data = await customerService.getWalletSummary(req.user.id, req.params.id);
  res.json({ success: true, data });
});

module.exports = {
  createCustomer,
  listCustomers,
  getCustomerDetails,
  updateCustomer,
  getWalletSummary
};
