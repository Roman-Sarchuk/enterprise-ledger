const mongoose = require("mongoose");
const { Category, ALLOWED_TYPES, EMOJI_REGEX } = require("../models/Category");
const Transaction = require("../models/Transaction");
const APIError = require("../utils/APIError");

const validateCategoryType = (type) => {
  if (!ALLOWED_TYPES.includes(type)) {
    throw new APIError(400, "Incorrect parameters", "Invalid category type");
  }
};

const validateCategoryIcon = (icon) => {
  if (!icon || icon.trim() === "") {
    throw new APIError(400, "Incorrect parameters", "Category icon is required");
  }

  if (!EMOJI_REGEX.test(icon.trim())) {
    throw new APIError(400, "Incorrect parameters", "Invalid category icon");
  }
};

const throwBadRequestOnValidationError = (error) => {
  if (error && error.name === "ValidationError") {
    throw new APIError(400, "Incorrect parameters", error.message);
  }

  throw error;
};

const getCategories = async (userId, pagePagination = {}) => {
  const { page = 1, limit = 10 } = pagePagination;
  const skip = (page - 1) * limit;

  const categories = await Category.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    categories: categories.map((category) => category.toPublicJSON()),
  };
};

const getCategoryById = async (userId, categoryId) => {
  if (categoryId === undefined) {
    throw new APIError(400, "Incorrect parameters", "Category ID is required");
  }

  const category = await Category.findOne({ _id: categoryId, userId });

  if (!category) {
    throw new APIError(404, "Category not found");
  }

  return {
    category: category.toPublicJSON(),
  };
};

const createCategory = async (userId, name, type, icon) => {
  if (!name || name.trim() === "" || !type || !icon) {
    throw new APIError(
      400,
      "Incorrect parameters",
      "Missing category name, icon or invalid type",
    );
  }

  validateCategoryType(type);
  validateCategoryIcon(icon);

  const existingCategory = await Category.findOne({ userId, name });
  if (existingCategory) {
    throw new APIError(409, "Category with this name already exists for user");
  }

  let category;

  try {
    category = await Category.create({
      userId,
      name,
      type,
      icon: icon.trim(),
    });
  } catch (error) {
    throwBadRequestOnValidationError(error);
  }

  return {
    category: category.toPublicJSON(),
  };
};

const updateCategory = async (userId, categoryId, name, type, icon) => {
  if (categoryId === undefined) {
    throw new APIError(400, "Incorrect parameters", "Category ID is required");
  }

  const category = await Category.findOne({ _id: categoryId, userId });

  if (!category) {
    throw new APIError(404, "Category not found");
  }

  if (category.isSystem) {
    throw new APIError(403, "Default categories cannot be modified");
  }

  if (name !== undefined && name !== category.name) {
    if (name.trim() === "") {
      throw new APIError(400, "Incorrect parameters", "Category name cannot be empty");
    }

    const duplicate = await Category.findOne({
      userId,
      name,
      _id: { $ne: categoryId },
    });

    if (duplicate) {
      throw new APIError(409, "Category with this name already exists for user");
    }

    category.name = name;
  }

  if (type !== undefined && type !== category.type) {
    validateCategoryType(type);
    category.type = type;
  }

  if (icon !== undefined && icon !== category.icon) {
    validateCategoryIcon(icon);
    category.icon = icon.trim();
  }

  let updatedCategory;

  try {
    updatedCategory = await category.save();
  } catch (error) {
    throwBadRequestOnValidationError(error);
  }

  return {
    category: updatedCategory.toPublicJSON(),
  };
};

const deleteCategory = async (userId, categoryId) => {
  if (categoryId === undefined) {
    throw new APIError(400, "Incorrect parameters", "Category ID is required");
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const category = await Category.findOne({ _id: categoryId, userId }).session(session);

      if (!category) {
        throw new APIError(404, "Category not found");
      }

      if (category.isSystem) {
        throw new APIError(403, "Default categories cannot be deleted");
      }

      const defaultCategory = await Category.findOne({
        userId,
        type: category.type,
        isSystem: true,
        _id: { $ne: category._id },
      }).session(session);

      if (!defaultCategory) {
        throw new APIError(500, "Default category for this type not found");
      }

      await Transaction.updateMany(
        { userId, categoryId: category._id },
        { $set: { categoryId: defaultCategory._id } },
        { session },
      );

      await Category.deleteOne({ _id: category._id, userId }, { session });
    });
  } finally {
    await session.endSession();
  }

  return 204;
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
