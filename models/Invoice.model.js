import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Invoice = sequelize.define(
  "Invoice",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    service_record_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    invoice_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    shop_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    shop_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    shop_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    customer_name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    customer_phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    whatsapp_number: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    bike_model: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    bike_number: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    final_total: {
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
    whatsapp_share_link: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    tableName: "invoices",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { unique: true, fields: ["service_record_id"] },
      { unique: true, fields: ["invoice_number"] }
    ]
  }
);

export default Invoice;
