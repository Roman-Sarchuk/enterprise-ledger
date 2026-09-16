const mongoose = require("mongoose");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const { Category } = require("../models/Category");
const APIError = require("../utils/APIError");

const parseDateOnly = (dateStr) => {
  const match = /^\d{4}-\d{2}-\d{2}$/.exec(dateStr);
  if (!match) {
    return null;
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

const formatDateOnly = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const validateDateRange = (dateFromStr, dateToStr) => {
  const dateFrom = parseDateOnly(dateFromStr);
  const dateTo = parseDateOnly(dateToStr);

  if (!dateFrom || !dateTo) {
    throw new APIError(400, "Incorrect parameters", "Invalid date format");
  }

  dateFrom.setHours(0, 0, 0, 0);
  dateTo.setHours(23, 59, 59, 999);

  if (dateTo < dateFrom) {
    throw new APIError(
      400,
      "Incorrect parameters",
      "dateTo must be later than or equal to dateFrom",
    );
  }

  return { dateFrom, dateTo };
};

const validateAccountAccess = async (userId, accountId) => {
  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    throw new APIError(
      400,
      "Incorrect parameters",
      "Invalid account ID format",
    );
  }

  const account = await Account.findOne({ _id: accountId, userId });
  if (!account) {
    throw new APIError(404, "Account not found");
  }

  return account;
};

const validatePointLimit = (pointLimit) => {
  if (pointLimit === undefined) {
    throw new APIError(400, "Incorrect parameters", "pointLimit is required");
  }

  const limit = Number(pointLimit);
  if (!Number.isInteger(limit) || limit < 2 || limit > 365) {
    throw new APIError(
      400,
      "Incorrect parameters",
      "pointLimit must be an integer between 2 and 365",
    );
  }

  return limit;
};

const getSummaryCategoriesReport = async (
  userId,
  accountId,
  dateFromStr,
  dateToStr,
) => {
  // Validate required parameters
  if (!accountId || !dateFromStr || !dateToStr) {
    throw new APIError(
      400,
      "Incorrect parameters",
      "accountId, dateFrom, and dateTo are required",
    );
  }

  const { dateFrom, dateTo } = validateDateRange(dateFromStr, dateToStr);
  await validateAccountAccess(userId, accountId);

  const result = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        accountId: new mongoose.Types.ObjectId(accountId),
        createdAt: { $gte: dateFrom, $lte: dateTo },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: {
          type: "$category.type",
          categoryId: "$categoryId",
        },
        categoryName: { $first: "$category.name" },
        categoryIcon: { $first: "$category.icon" },
        amount: { $sum: "$amount" },
      },
    },
    {
      $group: {
        _id: "$_id.type",
        total: { $sum: "$amount" },
        categories: {
          $push: {
            categoryId: "$_id.categoryId",
            categoryName: "$categoryName",
            categoryIcon: "$categoryIcon",
            amount: "$amount",
          },
        },
      },
    },
  ]);

  // Process results to add percentages and format response
  const income = result.find((r) => r._id === "income") || {
    total: 0,
    categories: [],
  };
  const expense = result.find((r) => r._id === "expense") || {
    total: 0,
    categories: [],
  };

  const formatCategoryData = (categories, total) => {
    return categories.map((cat) => ({
      category: {
        id: cat.categoryId.toString(),
        name: cat.categoryName,
        icon: cat.categoryIcon,
      },
      amount: cat.amount,
      percent: total > 0 ? Math.round((cat.amount / total) * 10000) / 100 : 0,
    }));
  };

  return {
    income: {
      total: income.total,
      byCategories: formatCategoryData(income.categories, income.total),
    },
    expense: {
      total: expense.total,
      byCategories: formatCategoryData(expense.categories, expense.total),
    },
  };
};

const getLiquidityCurveReport = async (
  userId,
  accountId,
  dateFromStr,
  dateToStr,
  pointLimit,
) => {
  // Validate required parameters
  if (!accountId || !dateFromStr || !dateToStr || !pointLimit) {
    throw new APIError(
      400,
      "Incorrect parameters",
      "accountId, dateFrom, dateTo, and pointLimit are required",
    );
  }

  const { dateFrom, dateTo } = validateDateRange(dateFromStr, dateToStr);
  await validateAccountAccess(userId, accountId);
  const limit = validatePointLimit(pointLimit);

  // Calculate starting balance (sum of all transactions before dateFrom)
  const startingBalanceResult = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        accountId: new mongoose.Types.ObjectId(accountId),
        createdAt: { $lt: dateFrom },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  const startingBalance = startingBalanceResult[0]?.total || 0;

  // Get all transactions in date range sorted by date
  const transactions = await Transaction.find({
    userId,
    accountId,
    createdAt: { $gte: dateFrom, $lte: dateTo },
  }).sort({ createdAt: 1 });

  // Calculate time intervals
  const totalMs = dateTo.getTime() - dateFrom.getTime();
  const intervalMs = totalMs / (limit - 1);

  // Generate report points
  const report = [];
  let currentBalance = startingBalance;
  let transactionIndex = 0;

  for (let i = 0; i < limit; i++) {
    const pointDate = new Date(dateFrom.getTime() + intervalMs * i);
    const pointDateStart = new Date(pointDate);
    pointDateStart.setHours(0, 0, 0, 0);
    const pointDateEnd = new Date(pointDate);
    pointDateEnd.setHours(23, 59, 59, 999);

    // Sum all transactions up to this point
    while (
      transactionIndex < transactions.length &&
      transactions[transactionIndex].createdAt <= pointDateEnd
    ) {
      currentBalance += transactions[transactionIndex].amount;
      transactionIndex++;
    }

    const dateStr = formatDateOnly(pointDate);
    report.push({
      date: dateStr,
      total: currentBalance,
    });
  }

  return { report };
};

const getCashFlowReport = async (
  userId,
  accountId,
  dateFromStr,
  dateToStr,
  pointLimit,
) => {
  // Validate required parameters
  if (!accountId || !dateFromStr || !dateToStr || !pointLimit) {
    throw new APIError(
      400,
      "Incorrect parameters",
      "accountId, dateFrom, dateTo, and pointLimit are required",
    );
  }

  const { dateFrom, dateTo } = validateDateRange(dateFromStr, dateToStr);
  await validateAccountAccess(userId, accountId);
  const limit = validatePointLimit(pointLimit);

  // Calculate starting balance (sum of all transactions before dateFrom)
  const startingBalanceResult = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        accountId: new mongoose.Types.ObjectId(accountId),
        createdAt: { $lt: dateFrom },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  const startingBalance = startingBalanceResult[0]?.total || 0;

  // Calculate time intervals
  const totalMs = dateTo.getTime() - dateFrom.getTime();
  const intervalMs = totalMs / (limit - 1);

  // Get all transactions with category info
  const transactions = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        accountId: new mongoose.Types.ObjectId(accountId),
        createdAt: { $gte: dateFrom, $lte: dateTo },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category",
    },
  ]);

  // Generate report points
  const report = [];
  let currentBalance = startingBalance;

  for (let i = 0; i < limit - 1; i++) {
    const chunkStart = new Date(dateFrom.getTime() + intervalMs * i);
    const chunkEnd = new Date(dateFrom.getTime() + intervalMs * (i + 1));

    const chunkStart0 = new Date(chunkStart);
    chunkStart0.setHours(0, 0, 0, 0);
    const chunkEnd23 = new Date(chunkEnd);
    chunkEnd23.setHours(23, 59, 59, 999);

    // Filter transactions in this chunk
    const chunkTransactions = transactions.filter(
      (t) => t.createdAt >= chunkStart0 && t.createdAt <= chunkEnd23,
    );

    // Calculate income and expense based on category type
    let income = 0;
    let expense = 0;
    let balanceChange = 0;

    for (const tx of chunkTransactions) {
      if (tx.category.type === "income") {
        income += tx.amount;
        balanceChange += tx.amount;
      } else if (tx.category.type === "expense") {
        expense += tx.amount;
        balanceChange -= tx.amount;
      }
    }

    currentBalance += balanceChange;

    const chunkStartStr = formatDateOnly(chunkStart0);
    const chunkEndStr = formatDateOnly(chunkEnd23);

    report.push({
      dateFrom: chunkStartStr,
      dateTo: chunkEndStr,
      income,
      expense,
      balanceAfter: currentBalance,
    });
  }

  return { report };
};

module.exports = {
  getSummaryCategoriesReport,
  getLiquidityCurveReport,
  getCashFlowReport,
};
