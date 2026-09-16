const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getSummaryCategories,
  getLiquidityCurve,
  getCashFlow,
} = require("../controllers/reportController");

router.use(auth);

router.get("/summary/categories", getSummaryCategories);
router.get("/liquidity-curve", getLiquidityCurve);
router.get("/cash-flow", getCashFlow);

module.exports = router;
