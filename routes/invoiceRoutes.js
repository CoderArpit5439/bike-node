import express from "express";
import { getInvoiceDetail } from "../controllers/invoiceController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("scso"));

router.get("/:id", getInvoiceDetail);

export default router;
