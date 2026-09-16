const mongoose = require("mongoose");
const User = require("../models/User");
const Account = require("../models/Account");
const { Category } = require("../models/Category");
const Transaction = require("../models/Transaction");
const APIError = require("../utils/APIError");

const deleteMe = async (id) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const user = await User.findByIdAndDelete(id, { session });

      if (!user) {
        throw new APIError(404, "User not found");
      }

      await Transaction.deleteMany({ userId: id }, { session });
      await Account.deleteMany({ userId: id }, { session });
      await Category.deleteMany({ userId: id }, { session });
    });
  } finally {
    await session.endSession();
  }

  return 204; // No content
};

const updateMe = async (id, name) => {
  // Validate user input
  if (!name || name.trim() === "") {
    throw new APIError(
      400,
      "Validation failed",
      "Name is required and cannot be empty",
    );
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: { name } },
    { returnDocument: "after" },
  );

  return {
    user: user.toPublicJSON(),
  };
};

module.exports = {
  deleteMe,
  updateMe,
};
