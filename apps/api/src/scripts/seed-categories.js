import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { Category } from "../modules/categories/category.model.js";

dotenv.config();

const categories = [
  {
    name: "Mac",
    slug: "mac",
    image: "/assets/images/macbook-pro-16-inch.png",
    description: "Mac notebooks and desktops for creative work, productivity, and studio setups.",
    sortOrder: 1,
  },
  {
    name: "iPhone",
    slug: "iphone",
    image: "/assets/images/iphone-17-promax.png",
    description: "Current iPhone lineup with standard, Plus, Pro, and Pro Max hardware.",
    sortOrder: 2,
  },
  {
    name: "iPad",
    slug: "ipad",
    image: "/assets/images/ipad-pro-13-inch.png",
    description: "iPad tablets for note taking, sketching, media, and portable workflows.",
    sortOrder: 3,
  },
  {
    name: "Apple Watch",
    slug: "apple-watch",
    image: "/assets/images/apple-watch-ultra-3.png",
    description: "Apple Watch models built around health, fitness, and daily connectivity.",
    sortOrder: 4,
  },
  {
    name: "Apple Vision Pro",
    slug: "apple-vision-pro",
    image: "/assets/images/apple-vision-pro.png",
    description: "Spatial computing hardware built around immersive apps, video, and workspaces.",
    sortOrder: 5,
  },
  {
    name: "AirPods",
    slug: "airpods",
    image: "/assets/images/airpods-pro-3.png",
    description: "AirPods audio products spanning open-fit, Pro, and over-ear listening.",
    sortOrder: 6,
  },
];

async function seedCategories() {
  await connectDatabase(process.env.MONGODB_URI);

  const slugs = categories.map((item) => item.slug);
  await Category.deleteMany({ slug: { $nin: slugs } });

  for (const item of categories) {
    await Category.findOneAndUpdate(
      { slug: item.slug },
      { ...item, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`Seeded ${categories.length} categories`);
}

seedCategories()
  .catch((error) => {
    console.error("Category seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
