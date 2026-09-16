const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    amount: { type: Number, required: true },
    description: { type: String, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

TransactionSchema.methods.toPublicJSON = function () {
  return {
    id: this._id.toString(),
    categoryId: this.categoryId,
    amount: this.amount,
    description: this.description,
    createdAt: this.createdAt,
  };
};

TransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Transaction", TransactionSchema);
