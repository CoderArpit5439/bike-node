import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Bike = sequelize.define(
  "Bike",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bike_model: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    bike_number: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    tableName: "bikes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["customer_id"] },
      { fields: ["bike_number"] }
    ]
  }
);

export default Bike;
