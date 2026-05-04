import express from "express";
import { adminLogin, getProfile, scsoLogin, scsoSignup } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../utils/validation.js";
import { loginValidation, scsoSignupValidation } from "../validators/authValidators.js";

const router = express.Router();

router.post("/admin/login", loginValidation, validate, adminLogin);
router.post("/scso/signup", scsoSignupValidation, validate, scsoSignup);
router.post("/scso/login", loginValidation, validate, scsoLogin);
router.get("/profile", authMiddleware, getProfile);

export default router;
