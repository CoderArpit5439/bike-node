import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const RewardTransaction = sequelize.define(
  "RewardTransaction",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    wallet_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    service_record_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM("earned", "redeemed", "adjustment"),
      allowNull: false
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: "reward_transactions",
    timestamps: false,
    indexes: [
      { fields: ["wallet_id"] },
      { fields: ["service_record_id"] }
    ]
  }
);

export default RewardTransaction;
