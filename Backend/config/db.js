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

<<<<<<< HEAD

=======
>>>>>>> 38bef84563932b0892d296ed59c1b3d2424f6b9e
export default sequelize;
