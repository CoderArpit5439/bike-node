import express from "express";
import { createReminder, listReminders, updateReminder } from "../controllers/reminderController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../utils/validation.js";
import { reminderValidation } from "../validators/reminderValidators.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("scso"));

router.post("/", reminderValidation, validate, createReminder);
router.get("/", listReminders);
router.put("/:id", reminderValidation, validate, updateReminder);

export default router;
