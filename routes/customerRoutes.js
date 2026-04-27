const router = require("express").Router();
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");
const customerController = require("../controllers/customerController");
const { customerValidation } = require("../validators/customerValidators");
const { validate } = require("../utils/validation");

router.use(authMiddleware, roleMiddleware("scso"));

router.post("/", customerValidation, validate, customerController.createCustomer);
router.get("/", customerController.listCustomers);
router.get("/:id", customerController.getCustomerDetails);
router.put("/:id", customerValidation, validate, customerController.updateCustomer);
router.get("/:id/wallet", customerController.getWalletSummary);

module.exports = router;
