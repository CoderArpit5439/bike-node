import { getEnvValue } from "./env.config.js";

const mysqlConfig = {
  host: getEnvValue("DB_HOST", "localhost"),
  port: Number(getEnvValue("DB_PORT", 3306)),
  username: getEnvValue("DB_USER", "root"),
  password: getEnvValue("DB_PASSWORD", ""),
  database: getEnvValue("DB_NAME", "bikexpert"),
  dialect: "mysql"
};

export default mysqlConfig;
