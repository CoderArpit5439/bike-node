const { pool } = require("../config/db");
const ApiError = require("../utils/apiError");
const { StatusCodes } = require("http-status-codes");

const getInvoiceDetail = async (scsoUserId, invoiceId) => {
  const [invoiceRows] = await pool.query(
    `SELECT i.id, i.invoice_number AS invoiceNumber, i.shop_name AS shopName, i.shop_address AS shopAddress,
            i.shop_phone AS shopPhone, i.customer_name AS customerName, i.customer_phone AS customerPhone,
            i.whatsapp_number AS whatsappNumber, i.bike_model AS bikeModel, i.bike_number AS bikeNumber,
            i.subtotal, i.discount_amount AS discountAmount, i.final_total AS finalTotal,
            i.points_earned AS pointsEarned, i.points_used AS pointsUsed, i.whatsapp_share_link AS whatsappShareLink,
            i.created_at AS createdAt, sr.id AS serviceRecordId
     FROM invoices i
     INNER JOIN service_records sr ON sr.id = i.service_record_id
     WHERE sr.scso_user_id = ? AND i.id = ?
     LIMIT 1`,
    [scsoUserId, invoiceId]
  );

  const invoice = invoiceRows[0];
  if (!invoice) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Invoice not found");
  }

  const [items] = await pool.query(
    `SELECT service_name AS serviceName, price, reward_points AS rewardPoints
     FROM service_record_items
     WHERE service_record_id = ?`,
    [invoice.serviceRecordId]
  );

  return {
    ...invoice,
    items
  };
};

module.exports = {
  getInvoiceDetail
};
