import mongoose from "mongoose";
import { User } from "../models/User";
import dotenv from "dotenv";

dotenv.config();

const cleanUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("Connecté à MongoDB Atlas");

    await User.deleteMany({});
    console.log("Collection Users nettoyée");
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await mongoose.disconnect();
  }
};

cleanUsers();
