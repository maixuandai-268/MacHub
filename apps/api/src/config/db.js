import mongoose from "mongoose";

export async function connectDatabase(connectionString) {
  if (!connectionString) {
    throw new Error("Missing MONGODB_URI");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(connectionString);
  console.log("Connected to MongoDB");
}
