import Joi from "joi";

export const userValidationSchemaSignUp = Joi.object({
  username: Joi.string().min(3).max(20).trim().lowercase().required().messages({
    "string.base": "Username must be a string",
    "string.empty": "Username is required",
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username must be at most 20 characters",
    "any.required": "Username is required",
  }),

  email: Joi.string().email().trim().lowercase().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$"
      )
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character",
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),

  phoneNumbers: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.base": "Phone numbers must be an array",
    "array.min": "At least one phone number is required",
    "any.required": "Phone numbers are required",
  }),

  addresses: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.base": "Addresses must be an array",
    "array.min": "At least one address is required",
    "any.required": "Addresses are required",
  }),

  age: Joi.number().integer().min(18).max(100).messages({
    "number.base": "Age must be a number",
    "number.min": "User must be at least 18 years old",
    "number.max": "User must be less than or equal to 100 years old",
  }),

  isLoggedIn: Joi.boolean().optional(),

  createdAt: Joi.date().optional(),
});

export const userValidationSchemaSignIn = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$"
      )
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character",
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
});
