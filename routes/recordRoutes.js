const router = require("express").Router();
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");
const recordController = require("../controllers/recordController");
const { recordValidation } = require("../validators/recordValidators");
const { validate } = require("../utils/validation");

router.use(authMiddleware, roleMiddleware("scso"));

router.get("/dashboard", recordController.getDashboard);
router.post("/", recordValidation, validate, recordController.createRecord);
router.get("/", recordController.listRecords);
router.get("/:id", recordController.getRecordDetail);

module.exports = router;
