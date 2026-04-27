const asyncHandler = require("../utils/asyncHandler");
const invoiceService = require("../services/invoiceService");

const getInvoiceDetail = asyncHandler(async (req, res) => {
  const data = await invoiceService.getInvoiceDetail(req.user.id, req.params.id);
  res.json({ success: true, data });
});

module.exports = {
  getInvoiceDetail
};
