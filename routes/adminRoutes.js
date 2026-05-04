import express from "express";
import { createScso, getDashboard, listCustomers, listScso, toggleScsoStatus, updateScso } from "../controllers/adminController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../utils/validation.js";
import { scsoValidation } from "../validators/adminValidators.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("admin"));

router.get("/dashboard", getDashboard);
router.post("/scso", scsoValidation, validate, createScso);
router.get("/scso", listScso);
router.put("/scso/:id", scsoValidation, validate, updateScso);
router.patch("/scso/:id/toggle-status", toggleScsoStatus);
router.get("/customers", listCustomers);

export default router;
