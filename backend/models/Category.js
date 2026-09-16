const mongoose = require("mongoose");

const ALLOWED_TYPES = ["income", "expense"];
const CATEGORY_ICON_MAX_LENGTH = 32;

const EMOJI_COMPONENT =
  "(?:\\p{Extended_Pictographic}(?:\\uFE0F)?(?:\\p{Emoji_Modifier})?)";
const EMOJI_REGEX = new RegExp(
  `^(?:${EMOJI_COMPONENT}(?:\\u200D${EMOJI_COMPONENT})*|(?:\\p{Regional_Indicator}{2})|(?:[0-9#*]\\uFE0F?\\u20E3))$`,
  "u",
);

const DEFAULT_SYSTEM_CATEGORIES = [
  { name: "Income", type: "income", icon: "💰" },
  { name: "Expense", type: "expense", icon: "💸" },
];

const CategorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    type: { type: String, enum: ALLOWED_TYPES, required: true },
    icon: {
      type: String,
      required: true,
      trim: true,
      maxlength: CATEGORY_ICON_MAX_LENGTH,
      validate: {
        validator: (value) => EMOJI_REGEX.test(value),
        message: "Category icon must be a valid emoji",
      },
    },
    isSystem: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

CategorySchema.index({ userId: 1, name: 1, type: 1 }, { unique: true });

CategorySchema.methods.toPublicJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    type: this.type,
    icon: this.icon,
    isSystem: this.isSystem,
  };
};

CategorySchema.methods.getAllowedTypes = function () {
  return ALLOWED_TYPES;
};

const Category = mongoose.model("Category", CategorySchema);

module.exports = {
  Category,
  ALLOWED_TYPES,
  EMOJI_REGEX,
  CATEGORY_ICON_MAX_LENGTH,
  DEFAULT_SYSTEM_CATEGORIES,
};
