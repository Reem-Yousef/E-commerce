import express from "express";
import {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} from "../Cart/cart.controller.js";
import { isAuth } from "../../middleware/isauthMiddleware.js";

const router = express.Router();

router.post("/add", isAuth, addToCart);
router.get("/", isAuth, getCart);
router.put("/update", isAuth, updateQuantity);
router.delete("/remove", isAuth, removeFromCart);
router.delete("/clear", isAuth, clearCart);

export default router;
