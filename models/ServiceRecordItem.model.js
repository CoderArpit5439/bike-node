import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const ServiceRecordItem = sequelize.define(
  "ServiceRecordItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    service_record_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    service_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    reward_points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: "service_record_items",
    timestamps: false,
    indexes: [
      { fields: ["service_record_id"] },
      { fields: ["service_id"] }
    ]
  }
);

export default ServiceRecordItem;
