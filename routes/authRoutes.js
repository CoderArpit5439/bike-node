const router = require("express").Router();
const { validate } = require("../utils/validation");
const { authMiddleware } = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");
const { loginValidation, scsoSignupValidation } = require("../validators/authValidators");

router.post("/admin/login", loginValidation, validate, authController.adminLogin);
router.post("/scso/signup", scsoSignupValidation, validate, authController.scsoSignup);
router.post("/scso/login", loginValidation, validate, authController.scsoLogin);
router.get("/profile", authMiddleware, authController.getProfile);

module.exports = router;
