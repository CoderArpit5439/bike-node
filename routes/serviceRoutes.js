const router = require("express").Router();
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");
const serviceController = require("../controllers/serviceController");
const { serviceValidation } = require("../validators/serviceValidators");
const { validate } = require("../utils/validation");

router.use(authMiddleware, roleMiddleware("scso"));

router.post("/", serviceValidation, validate, serviceController.createService);
router.get("/", serviceController.listServices);
router.put("/:id", serviceValidation, validate, serviceController.updateService);
router.delete("/:id", serviceController.deleteService);

module.exports = router;
