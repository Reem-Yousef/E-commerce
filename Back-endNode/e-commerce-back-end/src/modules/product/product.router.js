import express from "express";
import validate from"../../middleware/validationMiddleware.js";
import validateProduct from"./product.validation.js";
import validateSearch from"./searchProduct.validation.js";
import *as productController from"./product.controller.js";

const router = express.Router();

router.get("/search", validateSearch ? validate(validateSearch) : (req, res, next) => next(), productController.searchProducts);
// router.get("/search", validate(validateSearch), productController.searchProducts);
router.get("/search/suggestions", productController.getSearchSuggestions);

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.post("/", validate(validateProduct), productController.createProduct);

router.put("/:id", validate(validateProduct), productController.editProductById);
router.delete("/:id", productController.deletetProductById);
router.get("/:id/related", productController.getRelatedProducts);

export default router;
