const authService = require("../services/authService");


exports.register = async (req, res) => {
  // Get user input
  const { name, email, password } = req.body;

  // Perform logic
  const result = await authService.register(name, email, password);

  // Send response
  res.status(201).json(result);
};

exports.login = async (req, res) => {
  // Get user input
  const { email, password } = req.body;

  // Perform logic
  const result = await authService.login(email, password);

  // Send response
  res.status(200).json(result);
};

exports.forgotPassword = async (req, res) => {
  // Get user input
  const { email } = req.body;

  // Perform logic
  const result = await authService.forgotPassword(email);

  // Send response
  res.status(200).json(result);
};

exports.resetPassword = async (req, res) => {
  // Get user input
  const { token } = req.params;
  const { password } = req.body;

  // Perform logic
  const result = await authService.resetPassword(token, password);

  // Send response
  res.status(200).json(result);
};
