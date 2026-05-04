import express from "express";
import { getSettings, updateSettings } from "../controllers/settingController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../utils/validation.js";
import { settingValidation } from "../validators/settingValidators.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("scso"));

router.get("/", getSettings);
router.put("/", settingValidation, validate, updateSettings);

export default router;
