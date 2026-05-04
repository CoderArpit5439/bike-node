import asyncHandler from "../utils/asyncHandler.js";
import invoiceService from "../services/invoiceService.js";

export const getInvoiceDetail = asyncHandler(async (req, res) => {
  const data = await invoiceService.getInvoiceDetail(req.user.id, req.params.id);
  res.json({ success: true, data });
});
