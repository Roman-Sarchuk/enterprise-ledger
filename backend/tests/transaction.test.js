const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryReplSet } = require("mongodb-memory-server");

const app = require("../app");
const User = require("../models/User");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const { Category } = require("../models/Category");
const { registerUserAndGetToken } = require("./helpers/authTestHelper");

let mongoServer;

require("dotenv").config();

describe("Transaction API", () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = "DwD6fjjd2BLTBazHZt9ZTRs7VPpNtfHT7CMdpMxb2Y4";

    mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      Account.deleteMany({}),
      Transaction.deleteMany({}),
      Category.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe("GET /api/v1/transactions", () => {
    it("should return cursor-paginated transactions for current user", async () => {
      const { token } = await registerUserAndGetToken();

      // Create account
      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      // Create category
      const categoryRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Salary", type: "income", icon: "💰" });

      const categoryId = categoryRes.body.category.id;

      // Create 3 transactions
      for (let i = 1; i <= 3; i++) {
        await request(app)
          .post("/api/v1/transactions")
          .set("Authorization", token)
          .send({
            accountId,
            categoryId,
            amount: i * 100,
            description: `Transaction ${i}`,
          });
      }

      // Fetch first page
      const res = await request(app)
        .get("/api/v1/transactions?limit=2")
        .set("Authorization", token);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("transactions");
      expect(res.body).toHaveProperty("nextCursor");
      expect(res.body).toHaveProperty("hasMore", true);
      expect(Array.isArray(res.body.transactions)).toBe(true);
      expect(res.body.transactions.length).toEqual(2);

      // Verify transaction structure
      expect(res.body.transactions[0]).toHaveProperty("id");
      expect(res.body.transactions[0]).toHaveProperty("amount");
      expect(res.body.transactions[0]).toHaveProperty("categoryId");
      expect(res.body.transactions[0]).toHaveProperty("description");
      expect(res.body.transactions[0]).toHaveProperty("createdAt");
    });

    it("should fetch second page using nextCursor", async () => {
      const { token } = await registerUserAndGetToken();

      // Create account
      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      // Create category
      const categoryRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Food", type: "expense", icon: "🍔" });

      const categoryId = categoryRes.body.category.id;

      // Create 5 transactions
      const transactionIds = [];
      for (let i = 1; i <= 5; i++) {
        const txRes = await request(app)
          .post("/api/v1/transactions")
          .set("Authorization", token)
          .send({
            accountId,
            categoryId,
            amount: i * 100,
            description: `Transaction ${i}`,
          });
        transactionIds.push(txRes.body.transaction.id);
      }

      // Fetch first page
      const page1 = await request(app)
        .get("/api/v1/transactions?limit=2")
        .set("Authorization", token);

      expect(page1.statusCode).toEqual(200);
      expect(page1.body.transactions.length).toEqual(2);
      expect(page1.body.hasMore).toBe(true);
      const cursor = page1.body.nextCursor;

      // Fetch second page using cursor
      const page2 = await request(app)
        .get(`/api/v1/transactions?limit=2&nextCursor=${cursor}`)
        .set("Authorization", token);

      expect(page2.statusCode).toEqual(200);
      expect(page2.body.transactions.length).toEqual(2);
      expect(page2.body.hasMore).toBe(true);

      // Verify different transactions
      const page1Ids = page1.body.transactions.map((t) => t.id);
      const page2Ids = page2.body.transactions.map((t) => t.id);
      expect(page1Ids).not.toEqual(expect.arrayContaining(page2Ids));
    });

    it("should return 400 for invalid limit", async () => {
      const { token } = await registerUserAndGetToken();

      const res = await request(app)
        .get("/api/v1/transactions?limit=-1")
        .set("Authorization", token);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail");
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app)
        .get("/api/v1/transactions")
        .set("Authorization", "");

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("detail");
    });

    it("should return 400 for invalid cursor format", async () => {
      const { token } = await registerUserAndGetToken();

      const res = await request(app)
        .get("/api/v1/transactions?nextCursor=invalid-cursor")
        .set("Authorization", token);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail");
    });

    it("should filter transactions by accountId", async () => {
      const { token } = await registerUserAndGetToken();

      const account1Res = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Primary", currency: "UAH" });
      const account1Id = account1Res.body.account.id;

      const account2Res = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Secondary", currency: "UAH" });
      const account2Id = account2Res.body.account.id;

      const categoryRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Food", type: "expense", icon: "🍔" });
      const categoryId = categoryRes.body.category.id;

      await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", token)
        .send({ accountId: account1Id, categoryId, amount: 100 });

      await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", token)
        .send({ accountId: account2Id, categoryId, amount: 200 });

      const res = await request(app)
        .get(`/api/v1/transactions?accountId=${account1Id}`)
        .set("Authorization", token);

      expect(res.statusCode).toEqual(200);
      expect(res.body.transactions).toHaveLength(1);
      expect(res.body.transactions[0].amount).toEqual(100);
    });

    it("should return 400 for invalid accountId format", async () => {
      const { token } = await registerUserAndGetToken();

      const res = await request(app)
        .get("/api/v1/transactions?accountId=invalid-account-id")
        .set("Authorization", token);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail");
    });
  });

  describe("GET /api/v1/transactions/:id", () => {
    it("should return transaction by id", async () => {
      const { token } = await registerUserAndGetToken();

      // Create account
      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      // Create category
      const categoryRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Food", type: "expense", icon: "🍔" });

      const categoryId = categoryRes.body.category.id;

      // Create transaction
      const createRes = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", token)
        .send({
          accountId,
          categoryId,
          amount: 100,
          description: "Lunch",
        });

      const transactionId = createRes.body.transaction.id;

      const res = await request(app)
        .get(`/api/v1/transactions/${transactionId}`)
        .set("Authorization", token);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("transaction");
      expect(res.body.transaction).toHaveProperty("id", transactionId);
      expect(res.body.transaction).toHaveProperty("amount", 100);
      expect(res.body.transaction).toHaveProperty("description", "Lunch");
    });

    it("should return 404 when transaction not found", async () => {
      const { token } = await registerUserAndGetToken();
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .get(`/api/v1/transactions/${nonExistingId}`)
        .set("Authorization", token);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("detail", "Transaction not found");
    });

    it("should return 401 if no token provided", async () => {
      const id = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .get(`/api/v1/transactions/${id}`)
        .set("Authorization", "");

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("detail");
    });
  });

  describe("POST /api/v1/transactions", () => {
    it("should create transaction and update account balance atomically", async () => {
      const { token } = await registerUserAndGetToken();

      // Create account
      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;
      const initialBalance = accountRes.body.account.balance;

      // Create category
      const categoryRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Food", type: "expense", icon: "🍔" });

      const categoryId = categoryRes.body.category.id;

      // Create transaction
      const res = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", token)
        .send({
          accountId,
          categoryId,
          amount: 150,
          description: "Lunch",
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("transaction");
      expect(res.body.transaction).toHaveProperty("id");
      expect(res.body.transaction).toHaveProperty("amount", 150);
      expect(res.body.transaction).toHaveProperty("description", "Lunch");

      // Verify balance was updated atomically
      const accountCheck = await request(app)
        .get(`/api/v1/accounts/${accountId}`)
        .set("Authorization", token);

      expect(accountCheck.statusCode).toEqual(200);
      expect(accountCheck.body.account.balance).toEqual(initialBalance - 150);
    });

    it("should return 404 when account not found", async () => {
      const { token } = await registerUserAndGetToken();

      const nonExistingAccountId = new mongoose.Types.ObjectId().toString();
      const categoryRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Food", type: "expense", icon: "🍔" });

      const categoryId = categoryRes.body.category.id;

      const res = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", token)
        .send({
          accountId: nonExistingAccountId,
          categoryId,
          amount: 100,
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("detail", "Account not found");
    });

    it("should return 404 when category not found", async () => {
      const { token } = await registerUserAndGetToken();

      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;
      const nonExistingCategoryId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", token)
        .send({
          accountId,
          categoryId: nonExistingCategoryId,
          amount: 100,
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("detail", "Category not found");
    });

    it("should return 400 for invalid amount", async () => {
      const { token } = await registerUserAndGetToken();

      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      const categoryRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Food", type: "expense", icon: "🍔" });

      const categoryId = categoryRes.body.category.id;

      const res = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", token)
        .send({
          accountId,
          categoryId,
          amount: -50,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail", "Incorrect parameters");
    });

    it("should return 400 for missing required fields", async () => {
      const { token } = await registerUserAndGetToken();

      const res = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", token)
        .send({
          amount: 100,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail", "Incorrect parameters");
    });

    it("should create transaction without description", async () => {
      const { token } = await registerUserAndGetToken();

      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      const categoryRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Food", type: "expense", icon: "🍔" });

      const categoryId = categoryRes.body.category.id;

      const res = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", token)
        .send({
          accountId,
          categoryId,
          amount: 100,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.transaction).toHaveProperty("id");
      expect(res.body.transaction.description).toBeNull();
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", "")
        .send({
          accountId: "123",
          categoryId: "456",
          amount: 100,
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("detail");
    });
  });

  describe("PATCH /api/v1/transactions/:id", () => {
    it("should update transaction amount and adjust account balance atomically", async () => {
      const { token } = await registerUserAndGetToken();

      // Create account
      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      // Create category
      const categoryRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Food", type: "expense", icon: "🍔" });

      const categoryId = categoryRes.body.category.id;

      // Create transaction
      const createRes = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", token)
        .send({
          accountId,
          categoryId,
          amount: 100,
          description: "Lunch",
        });

      const transactionId = createRes.body.transaction.id;

      // Get balance after first transaction
      const accountAfterCreate = await request(app)
        .get(`/api/v1/accounts/${accountId}`)
        .set("Authorization", token);

      const balanceAfterCreate = accountAfterCreate.body.account.balance;
      expect(balanceAfterCreate).toEqual(-100);

      // Update transaction amount
      const updateRes = await request(app)
        .patch(`/api/v1/transactions/${transactionId}`)
        .set("Authorization", token)
        .send({
          amount: 150,
        });

      expect(updateRes.statusCode).toEqual(200);
      expect(updateRes.body.transaction).toHaveProperty("amount", 150);

      // Verify balance was updated atomically for an expense transaction
      const accountAfterUpdate = await request(app)
        .get(`/api/v1/accounts/${accountId}`)
        .set("Authorization", token);

      expect(accountAfterUpdate.body.account.balance).toEqual(-150);
    });

    it("should update transaction categoryId", async () => {
      const { token } = await registerUserAndGetToken();

      // Create account
      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      // Create categories
      const category1Res = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Food", type: "expense", icon: "🍔" });

      const category1Id = category1Res.body.category.id;

      const category2Res = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Transport", type: "expense", icon: "🚕" });

      const category2Id = category2Res.body.category.id;

      // Create transaction
      const createRes = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", token)
        .send({
          accountId,
          categoryId: category1Id,
          amount: 100,
        });

      const transactionId = createRes.body.transaction.id;

      // Update category
      const updateRes = await request(app)
        .patch(`/api/v1/transactions/${transactionId}`)
        .set("Authorization", token)
        .send({
          categoryId: category2Id,
        });

      expect(updateRes.statusCode).toEqual(200);
      expect(updateRes.body.transaction).toHaveProperty("categoryId");
      expect(updateRes.body.transaction.categoryId.toString()).toEqual(
        category2Id.toString()
      );
    });

    it("should update transaction description", async () => {
      const { token } = await registerUserAndGetToken();

      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      const categoryRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Food", type: "expense", icon: "🍔" });

      const categoryId = categoryRes.body.category.id;

      const createRes = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", token)
        .send({
          accountId,
          categoryId,
          amount: 100,
          description: "Lunch",
        });

      const transactionId = createRes.body.transaction.id;

      const updateRes = await request(app)
        .patch(`/api/v1/transactions/${transactionId}`)
        .set("Authorization", token)
        .send({
          description: "Dinner",
        });

      expect(updateRes.statusCode).toEqual(200);
      expect(updateRes.body.transaction).toHaveProperty(
        "description",
        "Dinner"
      );
    });

    it("should return 404 when category not found on update", async () => {
      const { token } = await registerUserAndGetToken();

      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      const categoryRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Food", type: "expense", icon: "🍔" });

      const categoryId = categoryRes.body.category.id;

      const createRes = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", token)
        .send({
          accountId,
          categoryId,
          amount: 100,
        });

      const transactionId = createRes.body.transaction.id;
      const nonExistingCategoryId = new mongoose.Types.ObjectId().toString();

      const updateRes = await request(app)
        .patch(`/api/v1/transactions/${transactionId}`)
        .set("Authorization", token)
        .send({
          categoryId: nonExistingCategoryId,
        });

      expect(updateRes.statusCode).toEqual(404);
      expect(updateRes.body).toHaveProperty("detail", "Category not found");
    });

    it("should return 404 when transaction not found", async () => {
      const { token } = await registerUserAndGetToken();
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .patch(`/api/v1/transactions/${nonExistingId}`)
        .set("Authorization", token)
        .send({
          amount: 200,
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("detail", "Transaction not found");
    });

    it("should return 400 for invalid amount", async () => {
      const { token } = await registerUserAndGetToken();

      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      const categoryRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Food", type: "expense", icon: "🍔" });

      const categoryId = categoryRes.body.category.id;

      const createRes = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", token)
        .send({
          accountId,
          categoryId,
          amount: 100,
        });

      const transactionId = createRes.body.transaction.id;

      const updateRes = await request(app)
        .patch(`/api/v1/transactions/${transactionId}`)
        .set("Authorization", token)
        .send({
          amount: -50,
        });

      expect(updateRes.statusCode).toEqual(400);
      expect(updateRes.body).toHaveProperty("detail", "Incorrect parameters");
    });
  });

  describe("DELETE /api/v1/transactions/:id", () => {
    it("should delete transaction and revert account balance atomically", async () => {
      const { token } = await registerUserAndGetToken();

      // Create account
      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      // Create category
      const categoryRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Food", type: "expense", icon: "🍔" });

      const categoryId = categoryRes.body.category.id;

      // Create transaction
      const createRes = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", token)
        .send({
          accountId,
          categoryId,
          amount: 150,
        });

      const transactionId = createRes.body.transaction.id;

      // Check balance after transaction
      const accountAfterCreate = await request(app)
        .get(`/api/v1/accounts/${accountId}`)
        .set("Authorization", token);

      expect(accountAfterCreate.body.account.balance).toEqual(-150);

      // Delete transaction
      const deleteRes = await request(app)
        .delete(`/api/v1/transactions/${transactionId}`)
        .set("Authorization", token);

      expect(deleteRes.statusCode).toEqual(204);

      // Verify transaction was deleted
      const getRes = await request(app)
        .get(`/api/v1/transactions/${transactionId}`)
        .set("Authorization", token);

      expect(getRes.statusCode).toEqual(404);

      // Verify balance was reverted atomically
      const accountAfterDelete = await request(app)
        .get(`/api/v1/accounts/${accountId}`)
        .set("Authorization", token);

      expect(accountAfterDelete.body.account.balance).toEqual(0);
    });

    it("should return 404 when deleting non-existing transaction", async () => {
      const { token } = await registerUserAndGetToken();
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .delete(`/api/v1/transactions/${nonExistingId}`)
        .set("Authorization", token);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("detail", "Transaction not found");
    });

    it("should return 401 if no token provided", async () => {
      const id = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .delete(`/api/v1/transactions/${id}`)
        .set("Authorization", "");

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("detail");
    });
  });

  describe("Transaction Atomic Operations", () => {
    it("should maintain balance consistency across multiple transactions", async () => {
      const { token } = await registerUserAndGetToken();

      // Create account
      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Complex Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      // Create category
      const categoryRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "General", type: "expense", icon: "📌" });

      const categoryId = categoryRes.body.category.id;

      // Create 3 transactions
      const tx1 = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", token)
        .send({ accountId, categoryId, amount: 100 });

      const tx2 = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", token)
        .send({ accountId, categoryId, amount: 200 });

      const tx3 = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", token)
        .send({ accountId, categoryId, amount: 150 });

      // Balance should be -450
      let account = await request(app)
        .get(`/api/v1/accounts/${accountId}`)
        .set("Authorization", token);
      expect(account.body.account.balance).toEqual(-450);

      // Delete tx2 (200)
      await request(app)
        .delete(`/api/v1/transactions/${tx2.body.transaction.id}`)
        .set("Authorization", token);

      // Balance should be -250
      account = await request(app)
        .get(`/api/v1/accounts/${accountId}`)
        .set("Authorization", token);
      expect(account.body.account.balance).toEqual(-250);

      // Update tx1 from 100 to 75 (difference = -25)
      await request(app)
        .patch(`/api/v1/transactions/${tx1.body.transaction.id}`)
        .set("Authorization", token)
        .send({ amount: 75 });

      // Balance should be -225
      account = await request(app)
        .get(`/api/v1/accounts/${accountId}`)
        .set("Authorization", token);
      expect(account.body.account.balance).toEqual(-225);

      // Update tx3 from 150 to 300 (difference = +150)
      await request(app)
        .patch(`/api/v1/transactions/${tx3.body.transaction.id}`)
        .set("Authorization", token)
        .send({ amount: 300 });

      // Balance should be -375
      account = await request(app)
        .get(`/api/v1/accounts/${accountId}`)
        .set("Authorization", token);
      expect(account.body.account.balance).toEqual(-375);
    });
  });

  describe("User Isolation", () => {
    it("should not allow access to another user's transactions", async () => {
      const user1 = await registerUserAndGetToken();
      const user2 = await registerUserAndGetToken();

      // User1 creates account and transaction
      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", user1.token)
        .send({ name: "User1 Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      const categoryRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", user1.token)
        .send({ name: "Food", type: "expense", icon: "🍔" });

      const categoryId = categoryRes.body.category.id;

      const txRes = await request(app)
        .post("/api/v1/transactions")
        .set("Authorization", user1.token)
        .send({ accountId, categoryId, amount: 100 });

      const transactionId = txRes.body.transaction.id;

      // User2 tries to access User1's transaction
      const res = await request(app)
        .get(`/api/v1/transactions/${transactionId}`)
        .set("Authorization", user2.token);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("detail", "Transaction not found");
    });
  });
});
