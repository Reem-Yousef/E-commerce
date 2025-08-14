import express from "express";
import { register, login, logout } from "../Auth/auth.controller.js";
import validate from "../../middleware/validationMiddleware.js";
import { isAuth } from "../../middleware/isauthMiddleware.js";

import {
  userValidationSchemaSignUp,
  userValidationSchemaSignIn,
} from "../Auth/auth.validation.js";

const router = express.Router();

router.post("/register", validate(userValidationSchemaSignUp), register);
router.post("/login", validate(userValidationSchemaSignIn), login);
router.post("/logout", isAuth, logout);

export default router;
