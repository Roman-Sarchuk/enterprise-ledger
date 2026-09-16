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

describe("Reports API", () => {
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

  describe("GET /api/v1/reports/summary/categories", () => {
    it("should return income and expense summary with category breakdown", async () => {
      const { token } = await registerUserAndGetToken();

      // Create account
      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;
      const userDoc = await User.findOne({});

      // Create categories
      const incomeRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Salary", type: "income", icon: "💰" });

      const expenseRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Food", type: "expense", icon: "🍔" });

      const incomeId = incomeRes.body.category.id;
      const expenseId = expenseRes.body.category.id;

      // Create transactions
      const baseDate = new Date("2024-01-15");

      // Income transactions
      await Transaction.create([
        {
          userId: userDoc._id,
          accountId: new mongoose.Types.ObjectId(accountId),
          categoryId: new mongoose.Types.ObjectId(incomeId),
          amount: 1000,
          createdAt: baseDate,
        },
        {
          userId: userDoc._id,
          accountId: new mongoose.Types.ObjectId(accountId),
          categoryId: new mongoose.Types.ObjectId(incomeId),
          amount: 500,
          createdAt: new Date("2024-01-20"),
        },
        // Expense transactions
        {
          userId: userDoc._id,
          accountId: new mongoose.Types.ObjectId(accountId),
          categoryId: new mongoose.Types.ObjectId(expenseId),
          amount: 200,
          createdAt: new Date("2024-01-18"),
        },
        {
          userId: userDoc._id,
          accountId: new mongoose.Types.ObjectId(accountId),
          categoryId: new mongoose.Types.ObjectId(expenseId),
          amount: 100,
          createdAt: new Date("2024-01-22"),
        },
      ]);

      const res = await request(app)
        .get("/api/v1/reports/summary/categories")
        .set("Authorization", token)
        .query({
          accountId,
          dateFrom: "2024-01-01",
          dateTo: "2024-01-31",
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("income");
      expect(res.body).toHaveProperty("expense");

      // Verify income totals
      expect(res.body.income.total).toEqual(1500);
      expect(res.body.income.byCategories).toHaveLength(1);
      expect(res.body.income.byCategories[0].amount).toEqual(1500);
      expect(res.body.income.byCategories[0].percent).toEqual(100);
      expect(res.body.income.byCategories[0].category).toHaveProperty("name", "Salary");
      expect(res.body.income.byCategories[0].category).toHaveProperty("icon", "💰");

      // Verify expense totals
      expect(res.body.expense.total).toEqual(300);
      expect(res.body.expense.byCategories).toHaveLength(1);
      expect(res.body.expense.byCategories[0].amount).toEqual(300);
      expect(res.body.expense.byCategories[0].percent).toEqual(100);
      expect(res.body.expense.byCategories[0].category).toHaveProperty("name", "Food");
    });

    it("should calculate percentages correctly for multiple categories", async () => {
      const { token } = await registerUserAndGetToken();

      // Create account
      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;
      const userDoc = await User.findOne({});

      // Create categories
      const cat1Res = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Food", type: "expense", icon: "🍔" });

      const cat2Res = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Transport", type: "expense", icon: "🚕" });

      const cat1Id = cat1Res.body.category.id;
      const cat2Id = cat2Res.body.category.id;

      // Create transactions: Food = 400, Transport = 600 (total 1000)
      await Transaction.create([
        {
          userId: userDoc._id,
          accountId: new mongoose.Types.ObjectId(accountId),
          categoryId: new mongoose.Types.ObjectId(cat1Id),
          amount: 400,
          createdAt: new Date("2024-01-15"),
        },
        {
          userId: userDoc._id,
          accountId: new mongoose.Types.ObjectId(accountId),
          categoryId: new mongoose.Types.ObjectId(cat2Id),
          amount: 600,
          createdAt: new Date("2024-01-20"),
        },
      ]);

      const res = await request(app)
        .get("/api/v1/reports/summary/categories")
        .set("Authorization", token)
        .query({
          accountId,
          dateFrom: "2024-01-01",
          dateTo: "2024-01-31",
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.expense.total).toEqual(1000);
      expect(res.body.expense.byCategories).toHaveLength(2);

      // Find Food and Transport in results
      const foodCat = res.body.expense.byCategories.find(
        (c) => c.category.name === "Food"
      );
      const transportCat = res.body.expense.byCategories.find(
        (c) => c.category.name === "Transport"
      );

      expect(foodCat.amount).toEqual(400);
      expect(foodCat.percent).toEqual(40); // 400/1000 = 40%

      expect(transportCat.amount).toEqual(600);
      expect(transportCat.percent).toEqual(60); // 600/1000 = 60%
    });

    it("should return 400 for missing required parameters", async () => {
      const { token } = await registerUserAndGetToken();

      const res = await request(app)
        .get("/api/v1/reports/summary/categories")
        .set("Authorization", token)
        .query({ accountId: "123" });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail");
    });

    it("should return 400 for invalid date range (dateTo < dateFrom)", async () => {
      const { token } = await registerUserAndGetToken();

      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      const res = await request(app)
        .get("/api/v1/reports/summary/categories")
        .set("Authorization", token)
        .query({
          accountId,
          dateFrom: "2024-01-31",
          dateTo: "2024-01-01",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail", "Incorrect parameters");
    });

    it("should return 404 for non-existing account", async () => {
      const { token } = await registerUserAndGetToken();
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .get("/api/v1/reports/summary/categories")
        .set("Authorization", token)
        .query({
          accountId: nonExistingId,
          dateFrom: "2024-01-01",
          dateTo: "2024-01-31",
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("detail", "Account not found");
    });

    it("should return 400 for invalid date format", async () => {
      const { token } = await registerUserAndGetToken();

      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      const res = await request(app)
        .get("/api/v1/reports/summary/categories")
        .set("Authorization", token)
        .query({
          accountId,
          dateFrom: "invalid-date",
          dateTo: "2024-01-31",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail", "Incorrect parameters");
    });

    it("should return empty categories when no transactions in date range", async () => {
      const { token } = await registerUserAndGetToken();

      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      const res = await request(app)
        .get("/api/v1/reports/summary/categories")
        .set("Authorization", token)
        .query({
          accountId,
          dateFrom: "2024-01-01",
          dateTo: "2024-01-31",
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.income.total).toEqual(0);
      expect(res.body.income.byCategories).toHaveLength(0);
      expect(res.body.expense.total).toEqual(0);
      expect(res.body.expense.byCategories).toHaveLength(0);
    });
  });

  describe("GET /api/v1/reports/liquidity-curve", () => {
    it("should return account balance progression over time", async () => {
      const { token } = await registerUserAndGetToken();

      // Create account
      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;
      const userDoc = await User.findOne({});

      // Create category
      const catRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "General", type: "expense", icon: "📌" });

      const catId = catRes.body.category.id;

      // Create transactions across dates from Jan 1 to Jan 31
      await Transaction.create([
        {
          userId: userDoc._id,
          accountId: new mongoose.Types.ObjectId(accountId),
          categoryId: new mongoose.Types.ObjectId(catId),
          amount: 100,
          createdAt: new Date("2024-01-05"),
        },
        {
          userId: userDoc._id,
          accountId: new mongoose.Types.ObjectId(accountId),
          categoryId: new mongoose.Types.ObjectId(catId),
          amount: 200,
          createdAt: new Date("2024-01-15"),
        },
        {
          userId: userDoc._id,
          accountId: new mongoose.Types.ObjectId(accountId),
          categoryId: new mongoose.Types.ObjectId(catId),
          amount: 150,
          createdAt: new Date("2024-01-25"),
        },
      ]);

      const res = await request(app)
        .get("/api/v1/reports/liquidity-curve")
        .set("Authorization", token)
        .query({
          accountId,
          dateFrom: "2024-01-01",
          dateTo: "2024-01-31",
          pointLimit: 5,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("report");
      expect(Array.isArray(res.body.report)).toBe(true);
      expect(res.body.report.length).toEqual(5); // pointLimit = 5

      // Verify structure of each point
      for (const point of res.body.report) {
        expect(point).toHaveProperty("date");
        expect(point).toHaveProperty("total");
        expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
      }

      // Ensure boundaries are preserved without timezone date shifting
      expect(res.body.report[0].date).toEqual("2024-01-01");
      expect(res.body.report[res.body.report.length - 1].date).toEqual("2024-01-31");

      // Verify running totals are correct
      expect(res.body.report[0].total).toEqual(0); // Start date, before first tx
      expect(res.body.report[res.body.report.length - 1].total).toEqual(450); // End date
    });

    it("should return 400 when pointLimit is missing", async () => {
      const { token } = await registerUserAndGetToken();

      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      const res = await request(app)
        .get("/api/v1/reports/liquidity-curve")
        .set("Authorization", token)
        .query({
          accountId,
          dateFrom: "2024-01-01",
          dateTo: "2024-01-31",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail", "Incorrect parameters");
    });

    it("should return 400 for invalid pointLimit", async () => {
      const { token } = await registerUserAndGetToken();

      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      // Test with pointLimit < 2
      let res = await request(app)
        .get("/api/v1/reports/liquidity-curve")
        .set("Authorization", token)
        .query({
          accountId,
          dateFrom: "2024-01-01",
          dateTo: "2024-01-31",
          pointLimit: 1,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail", "Incorrect parameters");

      // Test with pointLimit > 365
      res = await request(app)
        .get("/api/v1/reports/liquidity-curve")
        .set("Authorization", token)
        .query({
          accountId,
          dateFrom: "2024-01-01",
          dateTo: "2024-12-31",
          pointLimit: 366,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail", "Incorrect parameters");
    });

    it("should include starting balance from transactions before dateFrom", async () => {
      const { token } = await registerUserAndGetToken();

      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;
      const userDoc = await User.findOne({});

      const catRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "General", type: "expense", icon: "📌" });

      const catId = catRes.body.category.id;

      // Create transaction before dateFrom
      await Transaction.create({
        userId: userDoc._id,
        accountId: new mongoose.Types.ObjectId(accountId),
        categoryId: new mongoose.Types.ObjectId(catId),
        amount: 500,
        createdAt: new Date("2023-12-31"),
      });

      // Create transaction in range
      await Transaction.create({
        userId: userDoc._id,
        accountId: new mongoose.Types.ObjectId(accountId),
        categoryId: new mongoose.Types.ObjectId(catId),
        amount: 200,
        createdAt: new Date("2024-01-15"),
      });

      const res = await request(app)
        .get("/api/v1/reports/liquidity-curve")
        .set("Authorization", token)
        .query({
          accountId,
          dateFrom: "2024-01-01",
          dateTo: "2024-01-31",
          pointLimit: 3,
        });

      expect(res.statusCode).toEqual(200);
      // First point should have starting balance of 500 (from transaction before dateFrom)
      expect(res.body.report[0].total).toEqual(500);
      // Last point should have 500 + 200 = 700
      expect(res.body.report[res.body.report.length - 1].total).toEqual(700);
    });
  });

  describe("GET /api/v1/reports/cash-flow", () => {
    it("should return income, expense, and balance after for each time period", async () => {
      const { token } = await registerUserAndGetToken();

      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;
      const userDoc = await User.findOne({});

      // Create income and expense categories
      const incomeRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Salary", type: "income", icon: "💰" });

      const expenseRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Food", type: "expense", icon: "🍔" });

      const incomeId = incomeRes.body.category.id;
      const expenseId = expenseRes.body.category.id;

      // Create transactions
      await Transaction.create([
        {
          userId: userDoc._id,
          accountId: new mongoose.Types.ObjectId(accountId),
          categoryId: new mongoose.Types.ObjectId(incomeId),
          amount: 1000,
          createdAt: new Date("2024-01-10"),
        },
        {
          userId: userDoc._id,
          accountId: new mongoose.Types.ObjectId(accountId),
          categoryId: new mongoose.Types.ObjectId(expenseId),
          amount: 200,
          createdAt: new Date("2024-01-12"),
        },
        {
          userId: userDoc._id,
          accountId: new mongoose.Types.ObjectId(accountId),
          categoryId: new mongoose.Types.ObjectId(incomeId),
          amount: 500,
          createdAt: new Date("2024-01-20"),
        },
        {
          userId: userDoc._id,
          accountId: new mongoose.Types.ObjectId(accountId),
          categoryId: new mongoose.Types.ObjectId(expenseId),
          amount: 300,
          createdAt: new Date("2024-01-25"),
        },
      ]);

      const res = await request(app)
        .get("/api/v1/reports/cash-flow")
        .set("Authorization", token)
        .query({
          accountId,
          dateFrom: "2024-01-01",
          dateTo: "2024-01-31",
          pointLimit: 3,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("report");
      expect(Array.isArray(res.body.report)).toBe(true);
      expect(res.body.report.length).toEqual(2); // pointLimit - 1 = 2 intervals

      // Verify structure
      for (const point of res.body.report) {
        expect(point).toHaveProperty("dateFrom");
        expect(point).toHaveProperty("dateTo");
        expect(point).toHaveProperty("income");
        expect(point).toHaveProperty("expense");
        expect(point).toHaveProperty("balanceAfter");
      }
    });

    it("should calculate income and expense separately", async () => {
      const { token } = await registerUserAndGetToken();

      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;
      const userDoc = await User.findOne({});

      const incomeRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Salary", type: "income", icon: "💰" });

      const expenseRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Food", type: "expense", icon: "🍔" });

      const incomeId = incomeRes.body.category.id;
      const expenseId = expenseRes.body.category.id;

      // Create transactions: 1500 income, 300 expense
      await Transaction.create([
        {
          userId: userDoc._id,
          accountId: new mongoose.Types.ObjectId(accountId),
          categoryId: new mongoose.Types.ObjectId(incomeId),
          amount: 1000,
          createdAt: new Date("2024-01-10"),
        },
        {
          userId: userDoc._id,
          accountId: new mongoose.Types.ObjectId(accountId),
          categoryId: new mongoose.Types.ObjectId(incomeId),
          amount: 500,
          createdAt: new Date("2024-01-12"),
        },
        {
          userId: userDoc._id,
          accountId: new mongoose.Types.ObjectId(accountId),
          categoryId: new mongoose.Types.ObjectId(expenseId),
          amount: 300,
          createdAt: new Date("2024-01-15"),
        },
      ]);

      const res = await request(app)
        .get("/api/v1/reports/cash-flow")
        .set("Authorization", token)
        .query({
          accountId,
          dateFrom: "2024-01-01",
          dateTo: "2024-01-31",
          pointLimit: 2,
        });

      expect(res.statusCode).toEqual(200);
      const report = res.body.report;

      // All transactions are in one interval
      expect(report[0].income).toEqual(1500);
      expect(report[0].expense).toEqual(300);
      expect(report[0].balanceAfter).toEqual(1200); // 1500 - 300
    });

    it("should return 400 when pointLimit is missing", async () => {
      const { token } = await registerUserAndGetToken();

      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      const res = await request(app)
        .get("/api/v1/reports/cash-flow")
        .set("Authorization", token)
        .query({
          accountId,
          dateFrom: "2024-01-01",
          dateTo: "2024-01-31",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail", "Incorrect parameters");
    });

    it("should track running balance through multiple periods", async () => {
      const { token } = await registerUserAndGetToken();

      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;
      const userDoc = await User.findOne({});

      const incomeRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Salary", type: "income", icon: "💰" });

      const expenseRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Food", type: "expense", icon: "🍔" });

      const incomeId = incomeRes.body.category.id;
      const expenseId = expenseRes.body.category.id;

      // Create transactions across periods
      // Period 1: 1000 income + 200 expense = 800 net
      // Period 2: 500 income + 300 expense = 200 net
      // Running balance: 0 -> 800 -> 1000
      await Transaction.create([
        {
          userId: userDoc._id,
          accountId: new mongoose.Types.ObjectId(accountId),
          categoryId: new mongoose.Types.ObjectId(incomeId),
          amount: 1000,
          createdAt: new Date("2024-01-05"),
        },
        {
          userId: userDoc._id,
          accountId: new mongoose.Types.ObjectId(accountId),
          categoryId: new mongoose.Types.ObjectId(expenseId),
          amount: 200,
          createdAt: new Date("2024-01-08"),
        },
        {
          userId: userDoc._id,
          accountId: new mongoose.Types.ObjectId(accountId),
          categoryId: new mongoose.Types.ObjectId(incomeId),
          amount: 500,
          createdAt: new Date("2024-01-20"),
        },
        {
          userId: userDoc._id,
          accountId: new mongoose.Types.ObjectId(accountId),
          categoryId: new mongoose.Types.ObjectId(expenseId),
          amount: 300,
          createdAt: new Date("2024-01-25"),
        },
      ]);

      const res = await request(app)
        .get("/api/v1/reports/cash-flow")
        .set("Authorization", token)
        .query({
          accountId,
          dateFrom: "2024-01-01",
          dateTo: "2024-01-31",
          pointLimit: 3,
        });

      expect(res.statusCode).toEqual(200);
      const report = res.body.report;
      expect(report[0].balanceAfter).toEqual(800); // First period net
      expect(report[1].balanceAfter).toEqual(1000); // Running total

      // Ensure period boundaries are preserved without timezone date shifting
      expect(report[0].dateFrom).toEqual("2024-01-01");
      expect(report[report.length - 1].dateTo).toEqual("2024-01-31");
    });
  });

  describe("User Isolation", () => {
    it("should not allow access to another user's reports", async () => {
      const user1 = await registerUserAndGetToken();
      const user2 = await registerUserAndGetToken();

      // User1 creates account and transactions
      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", user1.token)
        .send({ name: "User1 Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      // User2 tries to access User1's reports
      const res = await request(app)
        .get("/api/v1/reports/summary/categories")
        .set("Authorization", user2.token)
        .query({
          accountId,
          dateFrom: "2024-01-01",
          dateTo: "2024-01-31",
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("detail", "Account not found");
    });
  });

  describe("Date Range Validation", () => {
    it("should reject when dateTo is before dateFrom", async () => {
      const { token } = await registerUserAndGetToken();

      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Test Account", currency: "UAH" });

      const accountId = accountRes.body.account.id;

      let res = await request(app)
        .get("/api/v1/reports/summary/categories")
        .set("Authorization", token)
        .query({
          accountId,
          dateFrom: "2024-01-31",
          dateTo: "2024-01-01",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.detail).toEqual("Incorrect parameters");

      res = await request(app)
        .get("/api/v1/reports/liquidity-curve")
        .set("Authorization", token)
        .query({
          accountId,
          dateFrom: "2024-01-31",
          dateTo: "2024-01-01",
          pointLimit: 5,
        });

      expect(res.statusCode).toEqual(400);

      res = await request(app)
        .get("/api/v1/reports/cash-flow")
        .set("Authorization", token)
        .query({
          accountId,
          dateFrom: "2024-01-31",
          dateTo: "2024-01-01",
          pointLimit: 5,
        });

      expect(res.statusCode).toEqual(400);
    });
  });
});
