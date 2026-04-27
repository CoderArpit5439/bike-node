const router = require("express").Router();
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");
const { scsoValidation } = require("../validators/adminValidators");
const { validate } = require("../utils/validation");

router.use(authMiddleware, roleMiddleware("admin"));

router.get("/dashboard", adminController.getDashboard);
router.post("/scso", scsoValidation, validate, adminController.createScso);
router.get("/scso", adminController.listScso);
router.put("/scso/:id", scsoValidation, validate, adminController.updateScso);
router.patch("/scso/:id/toggle-status", adminController.toggleScsoStatus);
router.get("/customers", adminController.listCustomers);

module.exports = router;
