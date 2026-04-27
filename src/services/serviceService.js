const { pool } = require("../config/db");
const ApiError = require("../utils/apiError");
const { StatusCodes } = require("http-status-codes");

const createService = async (scsoUserId, payload) => {
  const [result] = await pool.query(
    `INSERT INTO services (scso_user_id, service_name, description, price, reward_points, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      scsoUserId,
      payload.serviceName,
      payload.description || null,
      payload.price,
      payload.rewardPoints,
      payload.status || "active"
    ]
  );

  return result.insertId;
};

const listServices = async (scsoUserId, { search = "" }) => {
  const params = [scsoUserId];
  let query = `
    SELECT id, service_name AS serviceName, description, price, reward_points AS rewardPoints,
           status, created_at AS createdAt
    FROM services
    WHERE scso_user_id = ?`;

  if (search) {
    query += " AND service_name LIKE ?";
    params.push(`%${search}%`);
  }

  query += " ORDER BY created_at DESC";
  const [rows] = await pool.query(query, params);
  return rows;
};

const updateService = async (scsoUserId, serviceId, payload) => {
  const [existing] = await pool.query(
    "SELECT id FROM services WHERE scso_user_id = ? AND id = ? LIMIT 1",
    [scsoUserId, serviceId]
  );
  if (!existing.length) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
  }

  await pool.query(
    `UPDATE services
     SET service_name = ?, description = ?, price = ?, reward_points = ?, status = ?
     WHERE scso_user_id = ? AND id = ?`,
    [
      payload.serviceName,
      payload.description || null,
      payload.price,
      payload.rewardPoints,
      payload.status || "active",
      scsoUserId,
      serviceId
    ]
  );
};

const deleteService = async (scsoUserId, serviceId) => {
  const [result] = await pool.query("DELETE FROM services WHERE scso_user_id = ? AND id = ?", [
    scsoUserId,
    serviceId
  ]);

  if (!result.affectedRows) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Service not found");
  }
};

module.exports = {
  createService,
  listServices,
  updateService,
  deleteService
};
