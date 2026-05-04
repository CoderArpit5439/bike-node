import { Sequelize } from "sequelize";
import mysqlConfig from "./mysql.config.js";

export const sequelize = new Sequelize(mysqlConfig.database, mysqlConfig.username, mysqlConfig.password, {
  host: mysqlConfig.host,
  port: mysqlConfig.port,
  dialect: mysqlConfig.dialect,
  logging: false,
  define: {
    underscored: true
  }
});

export const testConnection = async () => {
  await sequelize.authenticate();
};

export default sequelize;
