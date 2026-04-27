const { pool } = require("../config/db");
const ApiError = require("../utils/apiError");
const { StatusCodes } = require("http-status-codes");

const createCustomer = async (scsoUserId, payload) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [customerResult] = await connection.query(
      `INSERT INTO customers
       (scso_user_id, full_name, phone_number, whatsapp_number, address, last_service_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        scsoUserId,
        payload.fullName,
        payload.phoneNumber,
        payload.whatsappNumber || null,
        payload.address || null,
        payload.lastServiceDate || null,
        payload.notes || null
      ]
    );

    await connection.query(
      `INSERT INTO bikes (customer_id, bike_model, bike_number, is_primary)
       VALUES (?, ?, ?, 1)`,
      [customerResult.insertId, payload.bikeModel, payload.bikeNumber]
    );

    await connection.query("INSERT INTO reward_wallets (customer_id, current_balance) VALUES (?, 0)", [
      customerResult.insertId
    ]);

    await connection.commit();
    return customerResult.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const listCustomers = async (scsoUserId, { search = "" }) => {
  const params = [scsoUserId];
  let query = `
    SELECT c.id, c.full_name AS fullName, c.phone_number AS phoneNumber,
           c.whatsapp_number AS whatsappNumber, c.last_service_date AS lastServiceDate,
           c.created_at AS createdAt, b.id AS bikeId, b.bike_model AS bikeModel, b.bike_number AS bikeNumber,
           COALESCE(w.current_balance, 0) AS walletBalance
    FROM customers c
    LEFT JOIN bikes b ON b.customer_id = c.id AND b.is_primary = 1
    LEFT JOIN reward_wallets w ON w.customer_id = c.id
    WHERE c.scso_user_id = ?`;

  if (search) {
    query += " AND (c.full_name LIKE ? OR c.phone_number LIKE ? OR b.bike_number LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += " ORDER BY c.created_at DESC";
  const [rows] = await pool.query(query, params);
  return rows;
};

const getCustomerDetails = async (scsoUserId, customerId) => {
  const [customerRows] = await pool.query(
    `SELECT c.id, c.full_name AS fullName, c.phone_number AS phoneNumber,
            c.whatsapp_number AS whatsappNumber, c.address, c.last_service_date AS lastServiceDate,
            c.notes, c.created_at AS createdAt, b.id AS bikeId, b.bike_model AS bikeModel, b.bike_number AS bikeNumber,
            COALESCE(w.current_balance, 0) AS walletBalance
     FROM customers c
     LEFT JOIN bikes b ON b.customer_id = c.id AND b.is_primary = 1
     LEFT JOIN reward_wallets w ON w.customer_id = c.id
     WHERE c.scso_user_id = ? AND c.id = ?
     LIMIT 1`,
    [scsoUserId, customerId]
  );

  const customer = customerRows[0];
  if (!customer) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
  }

  const [history] = await pool.query(
    `SELECT id, service_date AS serviceDate, total_amount AS totalAmount, discount_amount AS discountAmount,
            final_amount AS finalAmount, points_earned AS pointsEarned, points_used AS pointsUsed, service_notes AS serviceNotes
     FROM service_records
     WHERE scso_user_id = ? AND customer_id = ?
     ORDER BY service_date DESC`,
    [scsoUserId, customerId]
  );

  return { customer, history };
};

const updateCustomer = async (scsoUserId, customerId, payload) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      "SELECT id FROM customers WHERE scso_user_id = ? AND id = ? LIMIT 1",
      [scsoUserId, customerId]
    );

    if (!existing.length) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
    }

    await connection.query(
      `UPDATE customers
       SET full_name = ?, phone_number = ?, whatsapp_number = ?, address = ?, last_service_date = ?, notes = ?
       WHERE scso_user_id = ? AND id = ?`,
      [
        payload.fullName,
        payload.phoneNumber,
        payload.whatsappNumber || null,
        payload.address || null,
        payload.lastServiceDate || null,
        payload.notes || null,
        scsoUserId,
        customerId
      ]
    );

    await connection.query(
      `UPDATE bikes
       SET bike_model = ?, bike_number = ?
       WHERE customer_id = ? AND is_primary = 1`,
      [payload.bikeModel, payload.bikeNumber, customerId]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getWalletSummary = async (scsoUserId, customerId) => {
  const [walletRows] = await pool.query(
    `SELECT w.id, w.current_balance AS currentBalance
     FROM reward_wallets w
     INNER JOIN customers c ON c.id = w.customer_id
     WHERE c.scso_user_id = ? AND c.id = ?
     LIMIT 1`,
    [scsoUserId, customerId]
  );

  if (!walletRows.length) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Wallet not found");
  }

  const wallet = walletRows[0];
  const [transactions] = await pool.query(
    `SELECT id, service_record_id AS serviceRecordId, type, points, note, created_at AS createdAt
     FROM reward_transactions
     WHERE wallet_id = ?
     ORDER BY created_at DESC`,
    [wallet.id]
  );

  return {
    wallet,
    transactions
  };
};

module.exports = {
  createCustomer,
  listCustomers,
  getCustomerDetails,
  updateCustomer,
  getWalletSummary
};
