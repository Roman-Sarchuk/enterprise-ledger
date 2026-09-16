require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const { Category } = require("../models/Category");
const { getTransactionBalanceChange } = require("../utils/transactionBalance");

const rebuildAccountBalance = async (account) => {
  const transactions = await Transaction.find({ accountId: account._id }).sort({
    createdAt: 1,
    _id: 1,
  });

  if (transactions.length === 0) {
    return 0;
  }

  const categoryIds = [...new Set(transactions.map((transaction) => transaction.categoryId.toString()))];
  const categories = await Category.find({ _id: { $in: categoryIds } });
  const categoryTypeById = new Map(
    categories.map((category) => [category._id.toString(), category.type])
  );

  let balance = 0;

  for (const transaction of transactions) {
    const categoryType = categoryTypeById.get(transaction.categoryId.toString());

    if (!categoryType) {
      throw new Error(
        `Missing category ${transaction.categoryId.toString()} while rebuilding account ${account._id.toString()}`
      );
    }

    balance += getTransactionBalanceChange(categoryType, transaction.amount);
  }

  return balance;
};

const main = async () => {
  await connectDB();

  const accounts = await Account.find({});

  for (const account of accounts) {
    const balance = await rebuildAccountBalance(account);

    await Account.updateOne({ _id: account._id }, { $set: { balance } });
    console.log(
      `[LOG]: Recalculated balance for account ${account._id.toString()} -> ${balance}`
    );
  }

  await mongoose.connection.close();
};

main().catch(async (error) => {
  console.error(`[ERROR]: ${error.message}`);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});