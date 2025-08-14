import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./src/models/product-model."; 

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Connection error:", err);
    process.exit(1);
  }
};

const seedProducts = async () => {
  await connectDB();

  try {
    const products = [
      {
        title: "Silver Mist",
        description: "Faucibus lacus tincidunt molestie accumsan nibh non odio aenean molestie purus tristique sed tempor consequat risus tellus amet augue egestas mauris scelerisque donec ultrices.",
        price: "92.00$",
        category: "Indoor Plants",
        stock: 50,
        images: ["https://websitedemos.net/generic-ecommerce-02/wp-content/uploads/sites/1526/2025/03/product-03-400x434.jpg"],
        ratings: { average: 4.8, count: 230 },
      },
      {
        title: "Golden Glow",
        description: "Faucibus lacus tincidunt molestie accumsan nibh non odio aenean molestie purus tristique sed tempor consequat risus tellus amet augue egestas mauris scelerisque donec ultrices.",
        price: "$85.00",
        category: "Indoor Plants",
        stock: 40,
        images: ["https://websitedemos.net/generic-ecommerce-02/wp-content/uploads/sites/1526/2025/03/product-04.jpg"],
        ratings: { average: 4.7, count: 180 },
      },
      {
        title: "Desert Bloom",
        description: "Faucibus lacus tincidunt molestie accumsan nibh non odio aenean molestie purus tristique sed tempor consequat risus tellus amet augue egestas mauris scelerisque donec ultrices.",
        price: "$70.00",
        category: "Indoor Plants",
        stock: 100,
        images: ["https://websitedemos.net/generic-ecommerce-02/wp-content/uploads/sites/1526/2025/03/product-05.jpg"],
        ratings: { average: 4.9, count: 500 },
      }
    ];

    await Product.insertMany(products);

    console.table(products.map((p) => ({
      title: p.title,
      brand: p.brand,
      price: p.price
    })));

    console.log("✅ Products inserted successfully.");
    process.exit();
  } catch (err) {
    console.error("❌ Error inserting products:", err);
    process.exit(1);
  }
};

seedProducts();