const router = require("express").Router();
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");
const invoiceController = require("../controllers/invoiceController");

router.use(authMiddleware, roleMiddleware("scso"));

router.get("/:id", invoiceController.getInvoiceDetail);

module.exports = router;
