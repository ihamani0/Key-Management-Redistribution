import { DataTypes } from "sequelize";

import sequelize from "../config/db.js";

const USER = sequelize.define(
  "User",
  {
    // Auto-generated "id" field is created by Sequelize by default (primary key)
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, //finish defining coulumn
  {
    tableName: "users", // Explicit table name
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

export default USER;
