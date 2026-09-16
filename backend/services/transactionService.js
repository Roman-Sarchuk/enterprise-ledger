const mongoose = require("mongoose");
const Account = require("../models/Account");
const { Category } = require("../models/Category");
const Transaction = require("../models/Transaction");
const APIError = require("../utils/APIError");
const { getTransactionBalanceChange } = require("../utils/transactionBalance");

const getCategoryByIdOrThrow = async (userId, categoryId) => {
  const category = await Category.findOne({ _id: categoryId, userId });

  if (!category) {
    throw new APIError(404, "Category not found");
  }

  return category;
};

const getTransactions = async (userId, cursorPagination = {}, accountId) => {
  const { nextCursor = null, limit = 10 } = cursorPagination;

  const filter = { userId };

  if (accountId !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      throw new APIError(
        400,
        "Incorrect parameters",
        "Invalid accountId format. Must be a valid ObjectId"
      );
    }

    filter.accountId = new mongoose.Types.ObjectId(accountId);
  }

  // If nextCursor is provided, fetch items with _id < nextCursor
  if (nextCursor) {
    filter._id = { $lt: new mongoose.Types.ObjectId(nextCursor) };
  }

  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1); // Fetch one extra to determine if there are more results

  const hasMore = transactions.length > limit;
  const result = hasMore ? transactions.slice(0, limit) : transactions;
  const newNextCursor = hasMore ? result[result.length - 1]._id.toString() : null;

  return {
    transactions: result.map((t) => t.toPublicJSON()),
    nextCursor: newNextCursor,
    hasMore,
  };
};

const getTransactionById = async (userId, transactionId) => {
  if (transactionId === undefined) {
    throw new APIError(
      400,
      "Incorrect parameters",
      "Transaction ID is required"
    );
  }

  const transaction = await Transaction.findOne({ _id: transactionId, userId });

  if (!transaction) {
    throw new APIError(404, "Transaction not found");
  }

  return {
    transaction: transaction.toPublicJSON(),
  };
};

const createTransaction = async (
  userId,
  accountId,
  categoryId,
  amount,
  description
) => {
  // Validate input
  if (accountId === undefined) {
    throw new APIError(400, "Incorrect parameters", "Account ID is required");
  }

  if (categoryId === undefined) {
    throw new APIError(400, "Incorrect parameters", "Category ID is required");
  }

  if (amount === undefined || amount === null) {
    throw new APIError(400, "Incorrect parameters", "Amount is required");
  }

  if (typeof amount !== "number" || amount <= 0) {
    throw new APIError(400, "Incorrect parameters", "Amount must be positive");
  }

  // Verify account exists and belongs to user
  const account = await Account.findOne({ _id: accountId, userId });
  if (!account) {
    throw new APIError(404, "Account not found");
  }

  // Verify category exists and belongs to user
  const category = await getCategoryByIdOrThrow(userId, categoryId);

  // Create transaction with atomic balance update
  const session = await mongoose.startSession();

  try {
    let createdTransaction;

    await session.withTransaction(async () => {
      // Create transaction
      const transaction = new Transaction({
        userId,
        accountId,
        categoryId,
        amount,
        description: description || null,
        createdAt: new Date(),
      });

      createdTransaction = await transaction.save({ session });

      // Update account balance
      const balanceChange = getTransactionBalanceChange(category.type, amount);

      await Account.findByIdAndUpdate(
        accountId,
        { $inc: { balance: balanceChange } },
        { session }
      );
    });

    return {
      transaction: createdTransaction.toPublicJSON(),
    };
  } finally {
    await session.endSession();
  }
};

const updateTransaction = async (
  userId,
  transactionId,
  categoryId,
  amount,
  description
) => {
  if (transactionId === undefined) {
    throw new APIError(
      400,
      "Incorrect parameters",
      "Transaction ID is required"
    );
  }

  // Find the transaction first
  const transaction = await Transaction.findOne({
    _id: transactionId,
    userId,
  });

  if (!transaction) {
    throw new APIError(404, "Transaction not found");
  }

  // Validate amount if provided
  if (amount !== undefined && amount !== null) {
    if (typeof amount !== "number" || amount <= 0) {
      throw new APIError(
        400,
        "Incorrect parameters",
        "Amount must be positive"
      );
    }
  }

  const currentCategory = await getCategoryByIdOrThrow(userId, transaction.categoryId);
  const nextCategory =
    categoryId !== undefined
      ? await getCategoryByIdOrThrow(userId, categoryId)
      : currentCategory;

  // Update with atomic balance adjustment if amount changed
  const session = await mongoose.startSession();

  try {
    let updatedTransaction;

    await session.withTransaction(async () => {
      // Update transaction fields
      if (categoryId !== undefined) {
        transaction.categoryId = categoryId;
      }

      if (description !== undefined) {
        transaction.description = description || null;
      }

      const nextAmount = amount !== undefined ? amount : transaction.amount;
      const currentBalanceChange = getTransactionBalanceChange(
        currentCategory.type,
        transaction.amount
      );
      const nextBalanceChange = getTransactionBalanceChange(
        nextCategory.type,
        nextAmount
      );
      const balanceDifference = nextBalanceChange - currentBalanceChange;

      if (balanceDifference !== 0) {
        await Account.findByIdAndUpdate(
          transaction.accountId,
          { $inc: { balance: balanceDifference } },
          { session }
        );

        transaction.amount = nextAmount;
      }

      if (categoryId !== undefined) {
        transaction.categoryId = categoryId;
      }

      updatedTransaction = await transaction.save({ session });
    });

    return {
      transaction: updatedTransaction.toPublicJSON(),
    };
  } finally {
    await session.endSession();
  }
};

const deleteTransaction = async (userId, transactionId) => {
  if (transactionId === undefined) {
    throw new APIError(
      400,
      "Incorrect parameters",
      "Transaction ID is required"
    );
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Find and delete transaction
      const transaction = await Transaction.findOne(
        { _id: transactionId, userId },
        {},
        { session }
      );

      if (!transaction) {
        throw new APIError(404, "Transaction not found");
      }

      const category = await getCategoryByIdOrThrow(userId, transaction.categoryId);
      const balanceChange = getTransactionBalanceChange(category.type, transaction.amount);

      // Reverse the transaction effect on the account balance
      await Account.findByIdAndUpdate(
        transaction.accountId,
        { $inc: { balance: -balanceChange } },
        { session }
      );

      // Delete the transaction
      await Transaction.findByIdAndDelete(transactionId, { session });
    });

    return 204; // No content
  } finally {
    await session.endSession();
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
