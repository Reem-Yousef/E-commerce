import express from "express";
import {
  toggleWishlist,
  getWishlist,
  removeFromWishlist,
} from "./wishlist.controller.js";
import { isAuth } from "../../middleware/isauthMiddleware.js";
import validate from "../../middleware/validationMiddleware.js";
import {
  toggleWishlistSchema,
  removeFromWishlistSchema,
} from "../wishlist/wishlist.validation.js";

const router = express.Router();

router.post("/", isAuth, validate(toggleWishlistSchema), toggleWishlist);

router.get("/", isAuth, getWishlist);

router.delete(
  "/:productId",
  isAuth,
  validate(removeFromWishlistSchema),
  removeFromWishlist
);

export default router;
