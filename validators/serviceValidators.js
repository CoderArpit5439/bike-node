const { body } = require("express-validator");

const serviceValidation = [
  body("serviceName").trim().notEmpty().withMessage("Service name is required"),
  body("price").isFloat({ min: 0 }).withMessage("Valid price is required"),
  body("rewardPoints").isInt({ min: 0 }).withMessage("Reward points must be zero or more")
];

module.exports = {
  serviceValidation
};
