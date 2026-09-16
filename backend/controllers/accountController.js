const accountService = require("../services/accountService");
const { parsePagePagination } = require("../utils/parsePagination");

exports.getAccounts = async (req, res) => {
  // Get user input
  const userId = req.user.id;
  const pagePagination = parsePagePagination(req.query.page, req.query.limit);

  // Perform logic
  const result = await accountService.getAccounts(userId, pagePagination);

  // Send response
  res.status(200).json(result);
};

exports.getAccountById = async (req, res) => {
  // Get user input
  const userId = req.user.id;
  const { id } = req.params;

  // Perform logic
  const result = await accountService.getAccountById(userId, id);

  // Send response
  res.status(200).json(result);
};

exports.createAccount = async (req, res) => {
  // Get user input
  const userId = req.user.id;
  const { name, currency } = req.body;

  // Perform logic
  const result = await accountService.createAccount(userId, name, currency);

  // Send response
  res.status(201).json(result);
};

exports.updateAccount = async (req, res) => {
  // Get user input
  const userId = req.user.id;
  const { id } = req.params;
  const { name, currency } = req.body;

  // Perform logic
  const result = await accountService.updateAccount(userId, id, name, currency);

  // Send response
  res.status(200).json(result);
};

exports.deleteAccount = async (req, res) => {
  // Get user input
  const userId = req.user.id;
  const { id } = req.params;

  // Perform logic
  const resultCode = await accountService.deleteAccount(userId, id);

  // Send response
  res.status(resultCode).send();
};
