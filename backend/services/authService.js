const mongoose = require("mongoose");
const crypto = require('crypto');
const User = require("../models/User");
const { Category, DEFAULT_SYSTEM_CATEGORIES } = require("../models/Category");
const hashPassword = require("../utils/hashPassword");
const generateToken = require("../utils/generateToken");
const APIError = require("../utils/APIError");
const sendEmail = require('../utils/sendEmail');

const register = async (name, email, password) => {
  // Validate user input
  if (!name || name.trim() === "") {
    throw new APIError(400, "Incorrect parameters", "Name are required");
  } else if (!email || email.trim() === "") {
    throw new APIError(400, "Incorrect parameters", "Email are required");
  } else if (!password || password.trim() === "") {
    throw new APIError(400, "Incorrect parameters", "Password are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new APIError(409, "User already exists");

  const hashed = await hashPassword(password);

  const session = await mongoose.startSession();
  let user;

  try {
    await session.withTransaction(async () => {
      user = new User({
        name,
        email,
        passwordHash: hashed,
      });

      await user.save({ session });

      const defaultCategories = DEFAULT_SYSTEM_CATEGORIES.map((category) => ({
        ...category,
        userId: user._id,
        isSystem: true,
      }));

      await Category.insertMany(defaultCategories, { session });
    });
  } finally {
    await session.endSession();
  }

  return {
    user: user.toPublicJSON(),
    token: generateToken(user.getId()),
  };
};

const login = async (email, password) => {
  // Validate user input
  if (!email || email.trim() === "") {
    throw new APIError(400, "Incorrect parameters", "Email are required");
  } else if (!password || password.trim() === "") {
    throw new APIError(400, "Incorrect parameters", "Password are required");
  }

  const user = await User.findOne({ email });
  if (!user) throw new APIError(401, "Invalid credentials");

  const isMatch = await user.checkPassword(password);
  if (!isMatch) throw new APIError(401, "Invalid credentials");

  return {
    user: user.toPublicJSON(),
    token: generateToken(user.getId()),
  };
};

const forgotPassword = async (email) => {
  // Validate user input
  if (!email || email.trim() === "") {
    throw new APIError(400, "Incorrect parameters", "Email are required");
  }

  const user = await User.findOne({ email });

  // Prevent user enumeration: always respond with a generic message
  const genericResponse = { message: 'If an account with that email exists, a password reset link has been sent.' };
  if (!user) return genericResponse;

  // Generate a secure random token (raw sent in email) and store only its hash
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Set expiration (10 minutes)
  const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

  // Save hashed token and expiration to user document
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = resetPasswordExpire;
  await user.save();

  // Send reset email with raw token
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

  // const message = `\nHello!\nWe received a request to reset the password for your account. If this was you, click the link below (or copy and paste it into your browser) to set a new password:\n\n${resetUrl}\n\nThis link is valid for only 10 minutes. If you did not request a password reset, simply ignore this email. Your password will remain unchanged.\n`;
  const message = `\nHello!\nWe received a request to reset the password for "${user.email}". If this was you, click the link below (or copy and paste it into your browser) to set a new password:\n\n${resetUrl}\n\nThis link is valid for only 10 minutes. If you did not request a password reset, simply ignore this email. Your password will remain unchanged.\n`;

  try {
    await sendEmail({
      to: user.email,
      subject: `[Home Ledger] Password Reset Request for ${user.name}`,
      message,
    });
  } catch (err) {
    // rollback token on email failure
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    throw new APIError(500, 'Email sending failed', err.message);
  }

  return genericResponse;
};

const resetPassword = async (token, newPassword) => {
  // Validate user input
  if (!token || token.trim() === "") {
    throw new APIError(400, "Incorrect parameters", "Reset token is required");
  } else if (!newPassword || newPassword.trim() === "") {
    throw new APIError(400, "Incorrect parameters", "New password is required");
  }

  // Hash provided raw token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: new Date() },
  });
  if (!user) throw new APIError(400, "Invalid or expired token");

  const hashed = await hashPassword(newPassword);

  user.passwordHash = hashed;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return { message: "Password reset successfully" };
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword
};
