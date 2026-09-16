const transactionService = require("../services/transactionService");
const { parseCursorPagination } = require("../utils/parsePagination");

exports.getTransactions = async (req, res) => {
  // Get user input
  const userId = req.user.id;
  const { accountId } = req.query;
  const cursorPagination = parseCursorPagination(
    req.query.nextCursor,
    req.query.limit
  );

  // Perform logic
  const result = await transactionService.getTransactions(
    userId,
    cursorPagination,
    accountId
  );

  // Send response
  res.status(200).json(result);
};

exports.getTransactionById = async (req, res) => {
  // Get user input
  const userId = req.user.id;
  const { id } = req.params;

  // Perform logic
  const result = await transactionService.getTransactionById(userId, id);

  // Send response
  res.status(200).json(result);
};

exports.createTransaction = async (req, res) => {
  // Get user input
  const userId = req.user.id;
  const { accountId, categoryId, amount, description } = req.body;

  // Perform logic
  const result = await transactionService.createTransaction(
    userId,
    accountId,
    categoryId,
    amount,
    description
  );

  // Send response
  res.status(201).json(result);
};

exports.updateTransaction = async (req, res) => {
  // Get user input
  const userId = req.user.id;
  const { id } = req.params;
  const { categoryId, amount, description } = req.body;

  // Perform logic
  const result = await transactionService.updateTransaction(
    userId,
    id,
    categoryId,
    amount,
    description
  );

  // Send response
  res.status(200).json(result);
};

exports.deleteTransaction = async (req, res) => {
  // Get user input
  const userId = req.user.id;
  const { id } = req.params;

  // Perform logic
  const resultCode = await transactionService.deleteTransaction(userId, id);

  // Send response
  res.status(resultCode).send();
};
