import express from "express";
import { createRecord, getDashboard, getRecordDetail, listRecords } from "../controllers/recordController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../utils/validation.js";
import { recordValidation } from "../validators/recordValidators.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("scso"));

router.get("/dashboard", getDashboard);
router.post("/", recordValidation, validate, createRecord);
router.get("/", listRecords);
router.get("/:id", getRecordDetail);

export default router;
