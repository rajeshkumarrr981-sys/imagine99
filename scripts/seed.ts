// Seeds the database with sample products and an admin account.
// Run with: npm run seed   (reads .env.local). Prices are in Indian Rupees.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ProductModel } from "../src/models/Product";
import { User } from "../src/models/User";

const img = (n: number, sides = [1, 2]) => ({
  thumbnails: sides.map((s) => `/images/products/product-${n}-sm-${s}.png`),
  previews: sides.map((s) => `/images/products/product-${n}-bg-${s}.png`),
});

const products = [
  {
    title: "Havit HV-G69 USB Gamepad",
    description: "Wired USB gamepad with dual vibration motors and ergonomic grips. Plug-and-play on PC.",
    category: "Games & Videos",
    price: 2999,
    discountedPrice: 1499,
    stock: 40,
    images: img(1),
  },
  {
    title: "iPhone 14 Plus , 6/128GB",
    description: "6.7-inch Super Retina XDR display, A15 Bionic chip and all-day battery life.",
    category: "Mobile & Tablets",
    price: 79900,
    discountedPrice: 69900,
    stock: 15,
    images: img(2),
  },
  {
    title: "Apple iMac M1 24-inch 2021",
    description: "Strikingly thin all-in-one with the M1 chip and a 4.5K Retina display.",
    category: "Laptop & PC",
    price: 134900,
    discountedPrice: 124900,
    stock: 6,
    images: img(3),
  },
  {
    title: "MacBook Air M1 chip, 8/256GB",
    description: "Fanless, silent and fast. Up to 18 hours of battery life.",
    category: "Laptop & PC",
    price: 99900,
    discountedPrice: 79990,
    stock: 10,
    images: img(4),
  },
  {
    title: "Apple Watch Ultra",
    description: "Rugged titanium case, precision dual-frequency GPS and up to 36 hours of battery.",
    category: "Watches",
    price: 89900,
    discountedPrice: 79900,
    stock: 12,
    images: img(5),
  },
  {
    title: "Logitech MX Master 3 Mouse",
    description: "Advanced wireless mouse with MagSpeed scrolling and ergonomic design.",
    category: "Laptop & PC",
    price: 9995,
    discountedPrice: 7995,
    stock: 50,
    images: img(6),
  },
  {
    title: "Apple iPad Air 5th Gen - 64GB",
    description: "10.9-inch Liquid Retina display with the M1 chip. Works with Apple Pencil (2nd gen).",
    category: "Mobile & Tablets",
    price: 59900,
    discountedPrice: 54900,
    stock: 20,
    images: img(7),
  },
  {
    title: "Asus RT Dual Band Router",
    description: "Dual-band Wi-Fi router with gigabit ports and easy app setup.",
    category: "Home Appliances",
    price: 4999,
    discountedPrice: 3499,
    stock: 25,
    images: { thumbnails: ["/images/products/product-8-sm-1.png"], previews: ["/images/products/product-8-bg-1.png"] },
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(uri);

  const existing = await ProductModel.countDocuments();
  if (existing > 0 && !process.argv.includes("--force")) {
    console.log(`Products already exist (${existing}). Skipping products. Use --force to replace them.`);
  } else {
    await ProductModel.deleteMany({});
    await ProductModel.insertMany(products);
    console.log(`Inserted ${products.length} products.`);
  }

  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const passwordHash = await bcrypt.hash(password, 12);
    await User.updateOne(
      { email },
      { $set: { role: "admin", passwordHash }, $setOnInsert: { name: "Admin", email } },
      { upsert: true }
    );
    console.log(`Admin account ready: ${email}`);
  } else {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set, skipping admin account.");
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
