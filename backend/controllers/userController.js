const userService = require("../services/userService");

exports.deleteMe = async (req, res) => {
  // Get user input
  const userId = req.user.id;

  // Perform logic
  const resultCode = await userService.deleteMe(userId);

  // Send response
  res.status(resultCode).send();
};

exports.updateMe = async (req, res) => {
  // Get user input
  const userId = req.user.id;
  const { name } = req.body;

  // Perform logic
  const result = await userService.updateMe(userId, name);

  // Send response
  res.status(200).json(result);
};
