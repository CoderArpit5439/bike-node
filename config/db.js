const mysql = require("mysql2/promise");
const { getEnvValue } = require("./env");

const pool = mysql.createPool({
  host: getEnvValue("DB_HOST", "localhost"),
  port: Number(getEnvValue("DB_PORT", 3306)),
  user: getEnvValue("DB_USER", "root"),
  password: getEnvValue("DB_PASSWORD", ""),
  database: getEnvValue("DB_NAME", "bikexpert"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true
});

const testConnection = async () => {
  const connection = await pool.getConnection();
  await connection.ping();
  connection.release();
};

module.exports = {
  pool,
  testConnection
};
