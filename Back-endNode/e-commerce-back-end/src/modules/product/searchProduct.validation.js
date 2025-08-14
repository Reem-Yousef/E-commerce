import Joi from "joi";
const searchValidationSchema = Joi.object({
  q: Joi.string().trim().min(1).max(100).optional().allow(""),
  category: Joi.string().trim().max(50).optional(),
  brand: Joi.string().trim().max(30).optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  inStock: Joi.string().valid("true", "false").optional(),
  minRating: Joi.number().min(0).max(5).optional(),
  sortBy: Joi.string().valid(
    "relevance", 
    "price", 
    "rating", 
    "newest", 
    "oldest", 
    "name"
  ).default("relevance").optional(),
  order: Joi.string().valid("asc", "desc").default("desc").optional(),
  page: Joi.number().integer().min(1).default(1).optional(),
  limit: Joi.number().integer().min(1).max(50).default(12).optional()
}).custom((value, helpers) => {
  if (value.minPrice && value.maxPrice && value.maxPrice < value.minPrice) {
    return helpers.error('custom.maxPriceLessThanMin');
  }
  return value;
}).messages({
  'custom.maxPriceLessThanMin': 'Maximum price must be greater than minimum price'
});
export default searchValidationSchema;
