import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const ServiceRecord = sequelize.define(
  "ServiceRecord",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    scso_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bike_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    service_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    service_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    final_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    points_earned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    points_used: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    reminder_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: "service_records",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["scso_user_id"] },
      { fields: ["customer_id"] },
      { fields: ["bike_id"] },
      { fields: ["service_date"] }
    ]
  }
);

export default ServiceRecord;
