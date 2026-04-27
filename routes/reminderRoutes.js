const router = require("express").Router();
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");
const reminderController = require("../controllers/reminderController");
const { reminderValidation } = require("../validators/reminderValidators");
const { validate } = require("../utils/validation");

router.use(authMiddleware, roleMiddleware("scso"));

router.post("/", reminderValidation, validate, reminderController.createReminder);
router.get("/", reminderController.listReminders);
router.put("/:id", reminderValidation, validate, reminderController.updateReminder);

module.exports = router;
