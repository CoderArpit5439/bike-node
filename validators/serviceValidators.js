import { body } from "express-validator";

export const serviceValidation = [
  body("serviceName").trim().notEmpty().withMessage("Service name is required"),
  body("price").isFloat({ min: 0 }).withMessage("Valid price is required"),
  body("rewardPoints").isInt({ min: 0 }).withMessage("Reward points must be zero or more"),
  body("reminderMonths").optional({ values: "falsy" }).isInt({ min: 0 }).withMessage("Reminder months must be zero or more")
];
