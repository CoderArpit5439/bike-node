const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const ApiError = require("../utils/apiError");
const { StatusCodes } = require("http-status-codes");

const createScso = async (payload, adminId) => {
  const [existing] = await pool.query("SELECT id FROM scso_users WHERE email = ? LIMIT 1", [payload.email]);
  if (existing.length) {
    throw new ApiError(StatusCodes.CONFLICT, "SCSO email already exists");
  }

  const password = payload.password || "Scso@123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    `INSERT INTO scso_users
      (name, email, phone, password, shop_name, shop_address, whatsapp_number, created_by_admin_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.name,
      payload.email,
      payload.phone,
      hashedPassword,
      payload.shopName,
      payload.shopAddress || null,
      payload.whatsappNumber || null,
      adminId
    ]
  );

  return result.insertId;
};

const listScso = async ({ search = "", status = "" }) => {
  const params = [];
  let query = `
    SELECT id, name, email, phone, shop_name AS shopName, shop_address AS shopAddress,
           whatsapp_number AS whatsappNumber, status, created_at AS createdAt
    FROM scso_users
    WHERE 1=1`;

  if (search) {
    query += " AND (name LIKE ? OR email LIKE ? OR shop_name LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (status) {
    query += " AND status = ?";
    params.push(status);
  }

  query += " ORDER BY created_at DESC";

  const [rows] = await pool.query(query, params);
  return rows;
};

const updateScso = async (id, payload) => {
  const [existing] = await pool.query("SELECT id FROM scso_users WHERE id = ? LIMIT 1", [id]);
  if (!existing.length) {
    throw new ApiError(StatusCodes.NOT_FOUND, "SCSO not found");
  }

  await pool.query(
    `UPDATE scso_users
     SET name = ?, email = ?, phone = ?, shop_name = ?, shop_address = ?, whatsapp_number = ?
     WHERE id = ?`,
    [
      payload.name,
      payload.email,
      payload.phone,
      payload.shopName,
      payload.shopAddress || null,
      payload.whatsappNumber || null,
      id
    ]
  );
};

const toggleScsoStatus = async (id) => {
  const [rows] = await pool.query("SELECT status FROM scso_users WHERE id = ? LIMIT 1", [id]);
  const scso = rows[0];
  if (!scso) {
    throw new ApiError(StatusCodes.NOT_FOUND, "SCSO not found");
  }

  const nextStatus = scso.status === "active" ? "inactive" : "active";
  await pool.query("UPDATE scso_users SET status = ? WHERE id = ?", [nextStatus, id]);
  return nextStatus;
};

const listAllCustomers = async ({ search = "" }) => {
  const params = [];
  let query = `
    SELECT c.id, c.full_name AS fullName, c.phone_number AS phoneNumber,
           c.whatsapp_number AS whatsappNumber, c.last_service_date AS lastServiceDate,
           c.created_at AS createdAt, s.name AS ownerName, s.shop_name AS shopName
    FROM customers c
    INNER JOIN scso_users s ON s.id = c.scso_user_id
    WHERE 1=1`;

  if (search) {
    query += " AND (c.full_name LIKE ? OR c.phone_number LIKE ? OR s.shop_name LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += " ORDER BY c.created_at DESC";

  const [rows] = await pool.query(query, params);
  return rows;
};

const getDashboardAnalytics = async () => {
  const [[counts]] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM scso_users) AS totalScso,
      (SELECT COUNT(*) FROM customers) AS totalCustomers,
      (SELECT COUNT(*) FROM services) AS totalServices,
      (SELECT COUNT(*) FROM reminders) AS totalReminders
  `);

  const [recentScso] = await pool.query(
    `SELECT id, name, email, shop_name AS shopName, status, created_at AS createdAt
     FROM scso_users
     ORDER BY created_at DESC
     LIMIT 5`
  );

  const [recentCustomers] = await pool.query(
    `SELECT c.id, c.full_name AS fullName, c.phone_number AS phoneNumber,
            s.shop_name AS shopName, c.created_at AS createdAt
     FROM customers c
     INNER JOIN scso_users s ON s.id = c.scso_user_id
     ORDER BY c.created_at DESC
     LIMIT 5`
  );

  return {
    counts,
    recentScso,
    recentCustomers
  };
};

module.exports = {
  createScso,
  listScso,
  updateScso,
  toggleScsoStatus,
  listAllCustomers,
  getDashboardAnalytics
};
