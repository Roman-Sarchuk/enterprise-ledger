const mongoose = require("mongoose");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const APIError = require("../utils/APIError");

const { validateCurrency } = require("../utils/currencyHelper");

const getAccounts = async (userId, pagePagination = {}) => {
  const { page = 1, limit = 10 } = pagePagination;
  const skip = (page - 1) * limit;

  const accounts = await Account.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    accounts: accounts.map((account) => account.toPublicJSON()),
  };
};

const getAccountById = async (userId, accountId) => {
  if (accountId === undefined) {
    throw new APIError(400, "Incorrect parameters", "Account ID is required");
  }

  const account = await Account.findOne({ _id: accountId, userId });

  if (!account) {
    throw new APIError(404, "Account not found");
  }

  return {
    account: account.toPublicJSON(),
  };
};

const createAccount = async (userId, name, currency) => {
  // Validate user input
  if (!name || name.trim() === "") {
    throw new APIError(400, "Incorrect parameters", "Name is required");
  }

  if (!currency || currency.trim() === "") {
    throw new APIError(400, "Incorrect parameters", "Currency is required");
  }

  validateCurrency(currency);

  const existingAccount = await Account.findOne({
    userId,
    name,
  });

  if (existingAccount) {
    throw new APIError(409, "Account with this name already exists");
  }

  const account = await Account.create({
    userId,
    name,
    currency,
  });

  return {
    account: account.toPublicJSON(),
  };
};

const updateAccount = async (userId, accountId, name, currency) => {
  if (accountId === undefined) {
    throw new APIError(400, "Incorrect parameters", "Account ID is required");
  }

  const account = await Account.findOne({ _id: accountId, userId });

  if (!account) {
    throw new APIError(404, "Account not found");
  }

  if (name !== undefined && name !== account.name) {
    if (name.trim() === "") {
      throw new APIError(400, "Incorrect parameters", "Name cannot be empty");
    }

    const duplicate = await Account.findOne({ userId, name });
    if (duplicate) {
      throw new APIError(409, "Account with this name already exists");
    }

    account.name = name;
  }

  if (currency !== undefined && currency !== account.currency) {
    validateCurrency(currency);
    account.currency = currency;
  }

  const updatedAccount = await account.save();

  return {
    account: updatedAccount.toPublicJSON(),
  };
};

const deleteAccount = async (userId, accountId) => {
  if (accountId === undefined) {
    throw new APIError(400, "Incorrect parameters", "Account ID is required");
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const account = await Account.findByIdAndDelete(accountId, { session });

      if (!account) {
        throw new APIError(404, "Account not found");
      }

      await Transaction.deleteMany({ userId, accountId }, { session });
    });
  } finally {
    await session.endSession();
  }

  return 204; // No content
};

module.exports = {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
};
