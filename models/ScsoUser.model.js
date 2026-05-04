import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const ScsoUser = sequelize.define(
  "ScsoUser",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    shop_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    shop_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    whatsapp_number: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM("scso"),
      allowNull: false,
      defaultValue: "scso"
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active"
    },
    created_by_admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: "scso_users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { unique: true, fields: ["email"] },
      { fields: ["created_by_admin_id"] },
      { fields: ["status"] }
    ]
  }
);

export default ScsoUser;
