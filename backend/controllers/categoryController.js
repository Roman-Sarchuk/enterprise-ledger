const categoryService = require("../services/categoryService");
const { parsePagePagination } = require("../utils/parsePagination");

exports.getCategories = async (req, res) => {
  // Get user input
  const userId = req.user.id;
  const pagePagination = parsePagePagination(req.query.page, req.query.limit);

  // Perform logic
  const result = await categoryService.getCategories(userId, pagePagination);

  // Send response
  res.status(200).json(result);
};

exports.getCategoryById = async (req, res) => {
  // Get user input
  const userId = req.user.id;
  const { id } = req.params;

  // Perform logic
  const result = await categoryService.getCategoryById(userId, id);

  // Send response
  res.status(200).json(result);
};

exports.createCategory = async (req, res) => {
  // Get user input
  const userId = req.user.id;
  const { name, type, icon } = req.body;

  // Perform logic
  const result = await categoryService.createCategory(userId, name, type, icon);

  // Send response
  res.status(201).json(result);
};

exports.updateCategory = async (req, res) => {
  // Get user input
  const userId = req.user.id;
  const { id } = req.params;
  const { name, type, icon } = req.body;

  // Perform logic
  const result = await categoryService.updateCategory(userId, id, name, type, icon);

  // Send response
  res.status(200).json(result);
};

exports.deleteCategory = async (req, res) => {
  // Get user input
  const userId = req.user.id;
  const { id } = req.params;

  // Perform logic
  const resultCode = await categoryService.deleteCategory(userId, id);

  // Send response
  res.status(resultCode).send();
};
