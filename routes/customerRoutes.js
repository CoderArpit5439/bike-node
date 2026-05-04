import express from "express";
import { addBike, createCustomer, getCustomerDetails, getWalletSummary, listCustomers, updateCustomer } from "../controllers/customerController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../utils/validation.js";
import { customerValidation } from "../validators/customerValidators.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("scso"));

router.post("/", customerValidation, validate, createCustomer);
router.get("/", listCustomers);
router.get("/:id", getCustomerDetails);
router.put("/:id", customerValidation, validate, updateCustomer);
router.post("/:id/bikes", addBike);
router.get("/:id/wallet", getWalletSummary);

export default router;
