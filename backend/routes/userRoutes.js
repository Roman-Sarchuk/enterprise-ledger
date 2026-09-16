const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { deleteMe, updateMe } = require("../controllers/userController");

router.delete("/me", auth, deleteMe);
router.patch("/me", auth, updateMe);

module.exports = router;
