const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
	getAccounts,
	getAccountById,
	createAccount,
	updateAccount,
	deleteAccount,
} = require("../controllers/accountController");

router.use(auth);

router.get("/", getAccounts);
router.get("/:id", getAccountById);
router.post("/", createAccount);
router.patch("/:id", updateAccount);
router.delete("/:id", deleteAccount);

module.exports = router;