
const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');
const rateLimiter = require('../middleware/rateLimiter');

router.post('/register', register);
router.post('/login', login);
// apply a light rate limit to password reset requests to reduce abuse
router.post('/forgot-password', rateLimiter({ windowMs: 60 * 60 * 1000, max: 5 }), forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;