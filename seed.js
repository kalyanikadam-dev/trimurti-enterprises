import mongoose from "mongoose";
import Product from "./models/Product.js";
import dotenv from "dotenv";

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Seeding data...");

    await Product.deleteMany({});

    await Product.insertMany([
      {
        name: "Premium Glass Bottle 500ml",
        description: "High quality glass bottle for beverages.",
        price: 25,
        category: "bottle",
        images: ["/products/bottle1.jpeg"],
        featured: true,
      },
      {
        name: "Plastic PET Bottle 1L",
        description: "Durable PET bottle for water and juices.",
        price: 15,
        category: "bottle",
        images: ["/products/bottle2.jpeg"],
      },
      // Add more from public/products
    ]);

    console.log("Seeding complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
