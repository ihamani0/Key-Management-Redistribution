// node_module
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
// You must insrte the extension if you want import file localy
import { sequelize } from "./models/index.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import notFoundError from "./utils/notFoundError.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
// 👇 Middleware to parse form data
app.use(express.urlencoded({ extended: false }));

//cookies-parser
app.use(cookieParser());
//Cors Origin
app.use(
  cors({
    origin: "http://localhost:5173",
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    credentials: true,
  })
);

//log
if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"));
  console.log("--- Mode : ---:", process.env.NODE_ENV);
}

// Serve static files from the public directory
app.use(express.static("public"));

// Mount the authentication routes
app.use("/api/auth", authRoutes);

app.use("/api/user", userRoutes);


//notFound Route
app.all(/(.*)/, (req, res, next) => {
  next(new notFoundError(404, "Ther is No route exsists")); // This forwards the error to your error-handling middleware
});

// --- Error Handling Middleware ---
// IMPORTANT: Error handler must be the LAST piece of middleware added
app.use(errorHandler);


// Start the server after sync the database with all ccossbonding Models(tables)

sequelize
  .sync()
  .then(() => {
    console.log("Database synchronized.");
    // Start the server only after successful sync
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.log("Error Starting server", error));
