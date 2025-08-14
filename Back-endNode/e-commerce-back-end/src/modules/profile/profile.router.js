import express from "express";
import {
  getUserById,
  EditUserDataById,
} from "../profile/profile.controller.js";
const router = express.Router();
import validate from "../../middleware/validationMiddleware.js";
import { UpadtuserInformation } from "../../modules/profile/profile.validation.js";

router.get("/user/:id", getUserById);
router.put("/user/:id", validate(UpadtuserInformation), EditUserDataById);

export default router;
