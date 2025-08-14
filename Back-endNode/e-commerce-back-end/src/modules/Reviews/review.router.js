import express from "express";
import validate from"../../middleware/validationMiddleware.js";
import validateReview from"./review.validation.js";
import *as reviewController from"./review.controller.js";
const router=express.Router();



router.get("/product/:productId",reviewController.getAllReviewsofAProduct)
router.get("/:id",reviewController.getReviewById)
router.post("/",validate(validateReview),reviewController.createReview)
router.put("/:id",validate(validateReview),reviewController.editReviewById)
router.delete("/:id",reviewController.deleteReviewById)
export default router;