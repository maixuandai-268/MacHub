import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { Admin } from "../modules/auth/admin.model.js";

dotenv.config();

const DEFAULT_ADMIN = {
  email: process.env.SEED_ADMIN_EMAIL || "admin@cybershop.com",
  password: process.env.SEED_ADMIN_PASSWORD || "Admin@123456",
  name: process.env.SEED_ADMIN_NAME || "System Admin",
  role: process.env.SEED_ADMIN_ROLE || "super_admin",
};

async function seedAdmin() {
  await connectDatabase(process.env.MONGODB_URI);

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

  const admin = await Admin.findOneAndUpdate(
    { email: DEFAULT_ADMIN.email.toLowerCase() },
    {
      email: DEFAULT_ADMIN.email.toLowerCase(),
      name: DEFAULT_ADMIN.name,
      role: DEFAULT_ADMIN.role,
      isActive: true,
      passwordHash,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  console.log("Admin seed completed");
  console.log(`Email: ${admin.email}`);
  console.log(`Password: ${DEFAULT_ADMIN.password}`);
  console.log(`Role: ${admin.role}`);
}

seedAdmin()
  .catch((error) => {
    console.error("Admin seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
