import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const RewardWallet = sequelize.define(
  "RewardWallet",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    current_balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: "reward_wallets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{ unique: true, fields: ["customer_id"] }]
  }
);

export default RewardWallet;
