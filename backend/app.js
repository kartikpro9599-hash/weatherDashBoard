import express from "express";
import cors from "cors";
import db from "./db.js";
import apiRoutes from "./api/index.api.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

db();

app.use("/api", apiRoutes);

export default app;
