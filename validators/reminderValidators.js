const { body } = require("express-validator");

const reminderValidation = [
  body("customerId").isInt({ min: 1 }).withMessage("Customer is required"),
  body("reminderType").trim().notEmpty().withMessage("Reminder type is required"),
  body("message").trim().notEmpty().withMessage("Message is required"),
  body("scheduledAt").isISO8601().withMessage("Scheduled date is required")
];

module.exports = {
  reminderValidation
};
