import { body } from "express-validator";

export const recordValidation = [
  body("customerId").isInt({ min: 1 }).withMessage("Customer is required"),
  body("bikeId").isInt({ min: 1 }).withMessage("Bike is required"),
  body("serviceIds").isArray({ min: 1 }).withMessage("At least one service is required"),
  body("discountAmount").optional().isFloat({ min: 0 }).withMessage("Discount must be valid"),
  body("pointsToRedeem").optional().isInt({ min: 0 }).withMessage("Redeemed points must be valid")
];
