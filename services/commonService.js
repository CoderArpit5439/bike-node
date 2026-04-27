const { pool } = require("../config/db");

const getSettingValue = async (scopeType, scopeId, key, fallback = "") => {
  const [rows] = await pool.query(
    `SELECT setting_value
     FROM settings
     WHERE scope_type = ? AND ${scopeId ? "scope_id = ?" : "scope_id IS NULL"} AND setting_key = ?
     LIMIT 1`,
    scopeId ? [scopeType, scopeId, key] : [scopeType, key]
  );

  return rows[0]?.setting_value ?? fallback;
};

const upsertSetting = async (scopeType, scopeId, key, value) => {
  await pool.query(
    `INSERT INTO settings (scope_type, scope_id, setting_key, setting_value)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [scopeType, scopeId, key, value]
  );
};

module.exports = {
  getSettingValue,
  upsertSetting
};
