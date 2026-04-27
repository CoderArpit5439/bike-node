const router = require("express").Router();
const publicController = require("../controllers/publicController");
const { contactValidation } = require("../validators/publicValidators");
const { validate } = require("../utils/validation");

router.get("/bootstrap", publicController.getBootstrap);
router.post("/contact", contactValidation, validate, publicController.submitContactForm);

module.exports = router;
