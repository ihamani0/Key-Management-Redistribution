
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";


import router from "./routes/index.js";
import notFoundError from "./utils/notFoundError.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();
dotenv.config();





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






// Mount the routes
app.use("/api", router);




//notFound Route
app.all(/(.*)/, (req, res, next) => {
    next(new notFoundError(404, "Ther is No route exsists")); // This forwards the error to your error-handling middleware
});

// --- Error Handling Middleware ---


app.use(errorHandler);


export default app;