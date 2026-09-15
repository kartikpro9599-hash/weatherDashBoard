import express from "express";
import cors from "cors";
import db from "./db.js";

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

db();

export default app;
