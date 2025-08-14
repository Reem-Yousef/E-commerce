import Joi from "joi";

const productJoiSchema = Joi.object({
  title: Joi.string().trim().min(5).max(50).required(),
  description: Joi.string().trim().min(5).max(350).required(),
  price: Joi.number().min(0).required(),
  brand: Joi.string().trim().min(2).max(30).required(),
  stock: Joi.number().min(0).required(),
  images: Joi.array().items(Joi.string().uri()).min(1).required(),
  ratings: Joi.object({
    average: Joi.number().min(0).max(5).default(0),
    count: Joi.number().min(0).default(0),
  }),
  createdAt: Joi.date().default(() => new Date()),
});

export default productJoiSchema;
