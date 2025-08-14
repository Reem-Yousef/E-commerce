import Joi from "joi";

// Base schema for order data (without user)
const baseOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().precision(2).required(),
      })
    )
    .min(1)
    .required(),
  shippingAddress: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
  phoneNumbers: Joi.array()
    .items(Joi.string().pattern(/^\+?\d{7,15}$/))
    .min(1)
    .required(),
  totalAmount: Joi.number().precision(2).required(),
});

// For routes that expect 'user' in body (like POST /)
export const createOrderBodySchema = baseOrderSchema.keys({
  user: Joi.string().required(), // 'user' is required in body
});

// For authenticated routes where user comes from req.user.id (like POST /create-checkout-session)
export const createCheckoutSessionSchema = baseOrderSchema.keys({
  user: Joi.string().optional(), // Allow but don't require 'user' (will be ignored)
});

// Legacy export for backward compatibility
export const orderValidationSchema = baseOrderSchema;