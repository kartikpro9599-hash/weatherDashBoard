import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

const db = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not fpund");
    }
    await mongoose.connect(MONGO_URI);
    console.log("db connected");
    
  } catch (error) {
    console.log("error come from db connection :", error);
  }
};

export default db;
