import mongoose from "mongoose";
import envConfig from "../config/config.js";

let isConnected = false;

const connectToDatabase = async () => {
  // If already connected, reuse the connection
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }

  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(envConfig.mongodbString as string, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log("✅ MongoDB connected");

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
      isConnected = false;
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
      isConnected = false;
    });
  } catch (error) {
    console.log("❌ Failed to connect to MongoDB: ", error);
    isConnected = false;
    throw error;
  }
};

export default connectToDatabase;