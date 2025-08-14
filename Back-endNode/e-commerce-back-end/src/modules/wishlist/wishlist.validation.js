import Joi from "joi";

export const toggleWishlistSchema = Joi.object({
  productId: Joi.string().length(24).required().messages({
    "string.base": "Product ID must be a string",
    "string.length": "Product ID must be 24 characters",
    "any.required": "Product ID is required",
  }),
});

export const removeFromWishlistSchema = Joi.object({
  productId: Joi.string().length(24).required().messages({
    "string.base": "Product ID must be a string",
    "string.length": "Product ID must be 24 characters",
    "any.required": "Product ID is required",
  }),
});
