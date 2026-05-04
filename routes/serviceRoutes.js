import express from "express";
import { createService, deleteService, listServices, updateService } from "../controllers/serviceController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../utils/validation.js";
import { serviceValidation } from "../validators/serviceValidators.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("scso"));

router.post("/", serviceValidation, validate, createService);
router.get("/", listServices);
router.put("/:id", serviceValidation, validate, updateService);
router.delete("/:id", deleteService);

export default router;
