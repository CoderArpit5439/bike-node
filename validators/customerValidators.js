const { body } = require("express-validator");

const customerValidation = [
  body("fullName").trim().notEmpty().withMessage("Customer name is required"),
  body("phoneNumber").trim().notEmpty().withMessage("Phone number is required"),
  body("bikeModel").trim().notEmpty().withMessage("Bike model is required"),
  body("bikeNumber").trim().notEmpty().withMessage("Bike number is required")
];

module.exports = {
  customerValidation
};
