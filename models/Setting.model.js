import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Setting = sequelize.define(
  "Setting",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    scope_type: {
      type: DataTypes.ENUM("global", "scso"),
      allowNull: false,
      defaultValue: "scso"
    },
    scope_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    setting_key: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    setting_value: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    tableName: "settings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { unique: true, fields: ["scope_type", "scope_id", "setting_key"] },
      { fields: ["scope_type", "scope_id"] }
    ]
  }
);

export default Setting;
