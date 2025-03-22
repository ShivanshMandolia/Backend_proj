import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

// JSON and URL-encoded data limits
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // Static files
app.use(cookieParser()); // Secure cookies

// Import routes
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users", userRouter);


// ✅ Fix: Export `app` correctly
export {app};
