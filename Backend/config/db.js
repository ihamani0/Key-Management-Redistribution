import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: "localhost",
    dialect: "postgres", // Specify the dialect for PostgreSQL
  }
);

export const dbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("--- Data Base connection  ---:");
  } catch (error) {
    console.log("--- Data Base Connection Error  ---:", error);
  }
};

export const dbDeconnection = async () => {
  try {
    await sequelize.close();
    console.log("--- Data Base Deconnection  ---:");
  } catch (error) {
    console.log("--- Data Base Deconnection Error  ---:", error);
  }
};
export default sequelize;
