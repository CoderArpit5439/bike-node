const { pool } = require("../config/db");
const ApiError = require("../utils/apiError");
const { StatusCodes } = require("http-status-codes");
const { getSettingValue } = require("./commonService");

const createInvoiceNumber = (recordId) => `INV-${String(recordId).padStart(5, "0")}`;

const buildWhatsappLink = (phoneNumber, message) =>
  `https://wa.me/${String(phoneNumber || "").replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

const createServiceRecord = async (scsoUserId, payload) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [customerRows] = await connection.query(
      `SELECT c.id, c.full_name, c.phone_number, c.whatsapp_number, b.id AS bike_id, b.bike_model, b.bike_number,
              w.id AS wallet_id, w.current_balance
       FROM customers c
       INNER JOIN bikes b ON b.customer_id = c.id AND b.id = ?
       INNER JOIN reward_wallets w ON w.customer_id = c.id
       WHERE c.scso_user_id = ? AND c.id = ?
       LIMIT 1`,
      [payload.bikeId, scsoUserId, payload.customerId]
    );

    const customer = customerRows[0];
    if (!customer) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Customer or bike not found");
    }

    const [serviceRows] = await connection.query(
      `SELECT id, service_name, price, reward_points
       FROM services
       WHERE scso_user_id = ? AND id IN (?) AND status = 'active'`,
      [scsoUserId, payload.serviceIds]
    );

    if (!serviceRows.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "No valid services selected");
    }

    const subtotal = serviceRows.reduce((sum, item) => sum + Number(item.price), 0);
    const pointsEarned = serviceRows.reduce((sum, item) => sum + Number(item.reward_points), 0);
    const discountAmount = Number(payload.discountAmount || 0);
    const pointsToRedeem = Number(payload.pointsToRedeem || 0);

    if (pointsToRedeem > customer.current_balance) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Insufficient wallet points");
    }

    const finalAmount = Math.max(subtotal - discountAmount - pointsToRedeem, 0);

    const [recordResult] = await connection.query(
      `INSERT INTO service_records
       (scso_user_id, customer_id, bike_id, service_date, service_notes, total_amount, discount_amount, final_amount, points_earned, points_used, reminder_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        scsoUserId,
        payload.customerId,
        payload.bikeId,
        payload.serviceDate || new Date(),
        payload.serviceNotes || null,
        subtotal,
        discountAmount,
        finalAmount,
        pointsEarned,
        pointsToRedeem,
        payload.reminderDate || null
      ]
    );

    for (const service of serviceRows) {
      await connection.query(
        `INSERT INTO service_record_items
         (service_record_id, service_id, service_name, price, reward_points)
         VALUES (?, ?, ?, ?, ?)`,
        [recordResult.insertId, service.id, service.service_name, service.price, service.reward_points]
      );
    }

    let walletBalance = customer.current_balance;

    if (pointsToRedeem > 0) {
      walletBalance -= pointsToRedeem;
      await connection.query("UPDATE reward_wallets SET current_balance = ? WHERE id = ?", [
        walletBalance,
        customer.wallet_id
      ]);
      await connection.query(
        `INSERT INTO reward_transactions (wallet_id, service_record_id, type, points, note)
         VALUES (?, ?, 'redeemed', ?, ?)`,
        [customer.wallet_id, recordResult.insertId, pointsToRedeem, "Points used on service invoice"]
      );
    }

    walletBalance += pointsEarned;
    await connection.query("UPDATE reward_wallets SET current_balance = ? WHERE id = ?", [
      walletBalance,
      customer.wallet_id
    ]);
    await connection.query(
      `INSERT INTO reward_transactions (wallet_id, service_record_id, type, points, note)
       VALUES (?, ?, 'earned', ?, ?)`,
      [customer.wallet_id, recordResult.insertId, pointsEarned, "Points earned from service record"]
    );

    if (payload.reminderDate) {
      await connection.query(
        `INSERT INTO reminders (scso_user_id, customer_id, service_record_id, reminder_type, message, scheduled_at, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [
          scsoUserId,
          payload.customerId,
          recordResult.insertId,
          payload.reminderType || "Next service reminder",
          payload.reminderMessage || "Your next bike service is due soon. Visit us again at BikeXpert.",
          payload.reminderDate
        ]
      );
    }

    const [shopRows] = await connection.query(
      "SELECT shop_name, phone, shop_address, whatsapp_number FROM scso_users WHERE id = ? LIMIT 1",
      [scsoUserId]
    );
    const shop = shopRows[0];

    const invoiceNumber = createInvoiceNumber(recordResult.insertId);
    const invoiceSummary = `${invoiceNumber}\nCustomer: ${customer.full_name}\nBike: ${customer.bike_model} (${customer.bike_number})\nAmount: INR ${finalAmount}\nPoints Earned: ${pointsEarned}\nThank you for choosing ${shop.shop_name}.`;
    const whatsappShareLink = buildWhatsappLink(customer.whatsapp_number || customer.phone_number, invoiceSummary);

    await connection.query(
      `INSERT INTO invoices
       (service_record_id, invoice_number, shop_name, shop_address, shop_phone, customer_name, customer_phone,
        whatsapp_number, bike_model, bike_number, subtotal, discount_amount, final_total, points_earned, points_used, whatsapp_share_link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recordResult.insertId,
        invoiceNumber,
        shop.shop_name,
        shop.shop_address || "",
        shop.phone || "",
        customer.full_name,
        customer.phone_number,
        customer.whatsapp_number || "",
        customer.bike_model,
        customer.bike_number,
        subtotal,
        discountAmount,
        finalAmount,
        pointsEarned,
        pointsToRedeem,
        whatsappShareLink
      ]
    );

    await connection.commit();
    return recordResult.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const listServiceRecords = async (scsoUserId) => {
  const [rows] = await pool.query(
    `SELECT sr.id, sr.service_date AS serviceDate, sr.total_amount AS totalAmount, sr.discount_amount AS discountAmount,
            sr.final_amount AS finalAmount, sr.points_earned AS pointsEarned, sr.points_used AS pointsUsed,
            c.full_name AS customerName, b.bike_model AS bikeModel, b.bike_number AS bikeNumber, i.id AS invoiceId
     FROM service_records sr
     INNER JOIN customers c ON c.id = sr.customer_id
     INNER JOIN bikes b ON b.id = sr.bike_id
     LEFT JOIN invoices i ON i.service_record_id = sr.id
     WHERE sr.scso_user_id = ?
     ORDER BY sr.service_date DESC`,
    [scsoUserId]
  );

  return rows;
};

const getServiceRecordDetail = async (scsoUserId, recordId) => {
  const [recordRows] = await pool.query(
    `SELECT sr.id, sr.service_date AS serviceDate, sr.service_notes AS serviceNotes, sr.total_amount AS totalAmount,
            sr.discount_amount AS discountAmount, sr.final_amount AS finalAmount, sr.points_earned AS pointsEarned,
            sr.points_used AS pointsUsed, c.full_name AS customerName, c.phone_number AS phoneNumber,
            c.whatsapp_number AS whatsappNumber, b.bike_model AS bikeModel, b.bike_number AS bikeNumber
     FROM service_records sr
     INNER JOIN customers c ON c.id = sr.customer_id
     INNER JOIN bikes b ON b.id = sr.bike_id
     WHERE sr.scso_user_id = ? AND sr.id = ?
     LIMIT 1`,
    [scsoUserId, recordId]
  );

  const record = recordRows[0];
  if (!record) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service record not found");
  }

  const [items] = await pool.query(
    `SELECT id, service_id AS serviceId, service_name AS serviceName, price, reward_points AS rewardPoints
     FROM service_record_items
     WHERE service_record_id = ?`,
    [recordId]
  );

  const [invoiceRows] = await pool.query(
    `SELECT id, invoice_number AS invoiceNumber, whatsapp_share_link AS whatsappShareLink
     FROM invoices
     WHERE service_record_id = ?
     LIMIT 1`,
    [recordId]
  );

  return {
    ...record,
    items,
    invoice: invoiceRows[0] || null
  };
};

const getScsoDashboard = async (scsoUserId) => {
  const [[counts]] = await pool.query(
    `SELECT
      (SELECT COUNT(*) FROM customers WHERE scso_user_id = ?) AS totalCustomers,
      (SELECT COUNT(*) FROM services WHERE scso_user_id = ?) AS totalServices,
      (SELECT COUNT(*) FROM reminders WHERE scso_user_id = ?) AS totalReminders,
      (SELECT COUNT(*) FROM invoices i INNER JOIN service_records sr ON sr.id = i.service_record_id WHERE sr.scso_user_id = ?) AS totalBills,
      (SELECT COALESCE(SUM(points_earned), 0) FROM service_records WHERE scso_user_id = ?) AS totalRewardPointsIssued`,
    [scsoUserId, scsoUserId, scsoUserId, scsoUserId, scsoUserId]
  );

  const [recentCustomers] = await pool.query(
    `SELECT id, full_name AS fullName, phone_number AS phoneNumber, created_at AS createdAt
     FROM customers
     WHERE scso_user_id = ?
     ORDER BY created_at DESC
     LIMIT 5`,
    [scsoUserId]
  );

  const [recentServiceHistory] = await pool.query(
    `SELECT sr.id, sr.service_date AS serviceDate, sr.final_amount AS finalAmount, c.full_name AS customerName
     FROM service_records sr
     INNER JOIN customers c ON c.id = sr.customer_id
     WHERE sr.scso_user_id = ?
     ORDER BY sr.service_date DESC
     LIMIT 5`,
    [scsoUserId]
  );

  const [chartData] = await pool.query(
    `SELECT DATE_FORMAT(service_date, '%Y-%m') AS month, COUNT(*) AS totalServices, SUM(final_amount) AS revenue
     FROM service_records
     WHERE scso_user_id = ?
     GROUP BY DATE_FORMAT(service_date, '%Y-%m')
     ORDER BY month DESC
     LIMIT 6`,
    [scsoUserId]
  );

  return {
    counts,
    recentCustomers,
    recentServiceHistory,
    chartData: chartData.reverse()
  };
};

module.exports = {
  createServiceRecord,
  listServiceRecords,
  getServiceRecordDetail,
  getScsoDashboard
};
