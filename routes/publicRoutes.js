import express from "express";
import { getBootstrap, submitContactForm } from "../controllers/publicController.js";
import { validate } from "../utils/validation.js";
import { contactValidation } from "../validators/publicValidators.js";

const router = express.Router();

router.get("/bootstrap", getBootstrap);
router.post("/contact", contactValidation, validate, submitContactForm);

export default router;
