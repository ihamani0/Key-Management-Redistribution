import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: "127.0.0.1",
    dialect: "postgres", // Specify the dialect for PostgreSQL
  }
);


export default sequelize;
