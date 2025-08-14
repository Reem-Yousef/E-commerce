import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./src/middleware/errorHandllingMiddleware.js";
import authRoutes from "./src/modules/Auth/auth.router.js";
import userInfo from "./src/modules/profile/profile.router.js";
import productRoutes from "./src/modules/product/product.router.js";
import cartRoutes from "./src/modules/Cart/cart.router.js";
import orderRoutes from "./src/modules/Order/order.router.js";
import wishlistRoutes from "./src/modules/wishlist/wishlist.routes.js";
import reviewRoutes from "./src/modules/Reviews/review.router.js";
import db_connection from "./DB/DB-connection.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* --------------------------- Connect to MongoDB --------------------------- */
db_connection();
/* --------------------------------- Routes --------------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/userInfo", userInfo);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews",reviewRoutes)

/* ------------------------ Error Handling from middleWare  ----------------------- */
app.use(errorHandler);

// /* ------------------------ 404 Not Found  ------------------------ */
// app.use((req, res) => {
//   res.status(404).json({ error: "Route Not Found" });
// });

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "127.0.0.1";
app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
