import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Reminder = sequelize.define(
  "Reminder",
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
    service_record_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    reminder_type: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM("pending", "completed"),
      allowNull: false,
      defaultValue: "pending"
    }
  },
  {
    tableName: "reminders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["scso_user_id"] },
      { fields: ["customer_id"] },
      { fields: ["service_record_id"] },
      { fields: ["scheduled_at"] }
    ]
  }
);

export default Reminder;
