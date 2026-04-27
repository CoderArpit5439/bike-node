const router = require("express").Router();
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");
const settingController = require("../controllers/settingController");
const { settingValidation } = require("../validators/settingValidators");
const { validate } = require("../utils/validation");

router.use(authMiddleware, roleMiddleware("scso"));

router.get("/", settingController.getSettings);
router.put("/", settingValidation, validate, settingController.updateSettings);

module.exports = router;
