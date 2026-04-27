const { pool } = require("../config/db");
const ApiError = require("../utils/apiError");
const { StatusCodes } = require("http-status-codes");

const createReminder = async (scsoUserId, payload) => {
  const [customerRows] = await pool.query(
    "SELECT id FROM customers WHERE scso_user_id = ? AND id = ? LIMIT 1",
    [scsoUserId, payload.customerId]
  );

  if (!customerRows.length) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Customer not found");
  }

  const [result] = await pool.query(
    `INSERT INTO reminders (scso_user_id, customer_id, service_record_id, reminder_type, message, scheduled_at, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      scsoUserId,
      payload.customerId,
      payload.serviceRecordId || null,
      payload.reminderType,
      payload.message,
      payload.scheduledAt,
      payload.status || "pending"
    ]
  );

  return result.insertId;
};

const listReminders = async (scsoUserId, { status = "" }) => {
  const params = [scsoUserId];
  let query = `
    SELECT r.id, r.reminder_type AS reminderType, r.message, r.scheduled_at AS scheduledAt,
           r.status, c.full_name AS customerName
    FROM reminders r
    INNER JOIN customers c ON c.id = r.customer_id
    WHERE r.scso_user_id = ?`;

  if (status) {
    query += " AND r.status = ?";
    params.push(status);
  }

  query += " ORDER BY r.scheduled_at ASC";
  const [rows] = await pool.query(query, params);
  return rows;
};

const updateReminder = async (scsoUserId, reminderId, payload) => {
  const [result] = await pool.query(
    `UPDATE reminders
     SET reminder_type = ?, message = ?, scheduled_at = ?, status = ?
     WHERE scso_user_id = ? AND id = ?`,
    [payload.reminderType, payload.message, payload.scheduledAt, payload.status, scsoUserId, reminderId]
  );

  if (!result.affectedRows) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Reminder not found");
  }
};

module.exports = {
  createReminder,
  listReminders,
  updateReminder
};
