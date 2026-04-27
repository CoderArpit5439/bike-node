const { body } = require("express-validator");

const contactValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("message").trim().notEmpty().withMessage("Message is required")
];

module.exports = {
  contactValidation
};
