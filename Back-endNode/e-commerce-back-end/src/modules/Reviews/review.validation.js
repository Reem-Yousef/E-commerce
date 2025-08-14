import Joi from "joi";

const reviewJoiSchema = Joi.object({
  productId: Joi.string().length(24).required(),
  userId: Joi.string().length(24).required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().trim().min(5).max(500).required(),
  createdAt: Joi.date().default(() => new Date()),
});

export default reviewJoiSchema;
