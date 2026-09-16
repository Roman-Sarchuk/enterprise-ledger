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

describe("Account API", () => {
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

  describe("GET /api/v1/accounts", () => {
    it("should return paginated accounts for current user", async () => {
      const { token } = await registerUserAndGetToken();

      let postRes;
      postRes = await request(app).post("/api/v1/accounts").set("Authorization", token).send({
        name: "Account 1",
        currency: "UAH",
      });
      expect(postRes.statusCode).toEqual(201);
      postRes = await request(app).post("/api/v1/accounts").set("Authorization", token).send({
        name: "Account 2",
        currency: "USD",
      });
      expect(postRes.statusCode).toEqual(201);
      postRes = await request(app).post("/api/v1/accounts").set("Authorization", token).send({
        name: "Account 3",
        currency: "EUR",
      });
      expect(postRes.statusCode).toEqual(201);

      const res = await request(app)
        .get("/api/v1/accounts?page=1&limit=2")
        .set("Authorization", token);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("accounts");
      expect(Array.isArray(res.body.accounts)).toBe(true);
      expect(res.body.accounts.length).toEqual(2);
      expect(res.body.accounts[0]).toHaveProperty("id");
      expect(res.body.accounts[0]).toHaveProperty("name");
      expect(res.body.accounts[0]).toHaveProperty("balance");
      expect(res.body.accounts[0]).toHaveProperty("currency");
    });

    it("should return 400 for invalid pagination", async () => {
      const { token } = await registerUserAndGetToken();

      const res = await request(app)
        .get("/api/v1/accounts?page=0&limit=-1")
        .set("Authorization", token);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail");
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app).get("/api/v1/accounts").set("Authorization", "");

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("detail");
    });
  });

  describe("GET /api/v1/accounts/:id", () => {
    it("should return account by id", async () => {
      const { token } = await registerUserAndGetToken();

      const createRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({
          name: "Main Account",
          currency: "UAH",
        });

      const accountId = createRes.body.account.id;

      const res = await request(app)
        .get(`/api/v1/accounts/${accountId}`)
        .set("Authorization", token);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("account");
      expect(res.body.account).toHaveProperty("id", accountId);
      expect(res.body.account).toHaveProperty("name", "Main Account");
      expect(res.body.account).toHaveProperty("currency", "UAH");
    });

    it("should return 404 when account not found", async () => {
      const { token } = await registerUserAndGetToken();
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .get(`/api/v1/accounts/${nonExistingId}`)
        .set("Authorization", token);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("detail", "Account not found");
    });
  });

  describe("POST /api/v1/accounts", () => {
    it("should create account and return 201", async () => {
      const { token } = await registerUserAndGetToken();

      const res = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({
          name: "Savings",
          currency: "USD",
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("account");
      expect(res.body.account).toHaveProperty("name", "Savings");
      expect(res.body.account).toHaveProperty("currency", "USD");
      expect(res.body.account).toHaveProperty("balance", 0);
    });

    it("should return 400 for invalid currency", async () => {
      const { token } = await registerUserAndGetToken();

      const res = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({
          name: "Crypto",
          currency: "BTC",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail", "Incorrect parameters");
      expect(res.body).toHaveProperty("error");
    });

    it("should return 409 for duplicate account name", async () => {
      const { token } = await registerUserAndGetToken();

      await request(app).post("/api/v1/accounts").set("Authorization", token).send({
        name: "Wallet",
        currency: "UAH",
      });

      const res = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({
          name: "Wallet",
          currency: "USD",
        });

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty("detail", "Account with this name already exists");
    });
  });

  describe("PATCH /api/v1/accounts/:id", () => {
    it("should update account fields", async () => {
      const { token } = await registerUserAndGetToken();

      const createRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Primary", currency: "UAH" });

      const accountId = createRes.body.account.id;

      const res = await request(app)
        .patch(`/api/v1/accounts/${accountId}`)
        .set("Authorization", token)
        .send({ name: "Primary Updated", currency: "EUR" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.account).toHaveProperty("id", accountId);
      expect(res.body.account).toHaveProperty("name", "Primary Updated");
      expect(res.body.account).toHaveProperty("currency", "EUR");
    });

    it("should return 409 when updating to duplicate name", async () => {
      const { token } = await registerUserAndGetToken();

      const first = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "First", currency: "UAH" });

      await request(app).post("/api/v1/accounts").set("Authorization", token).send({
        name: "Second",
        currency: "USD",
      });

      const res = await request(app)
        .patch(`/api/v1/accounts/${first.body.account.id}`)
        .set("Authorization", token)
        .send({ name: "Second" });

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty("detail", "Account with this name already exists");
    });

    it("should return 400 for invalid currency on update", async () => {
      const { token } = await registerUserAndGetToken();

      const createRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({ name: "Editable", currency: "UAH" });

      const res = await request(app)
        .patch(`/api/v1/accounts/${createRes.body.account.id}`)
        .set("Authorization", token)
        .send({ currency: "PLN" });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail", "Incorrect parameters");
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("DELETE /api/v1/accounts/:id", () => {
    it("should delete account and related transactions", async () => {
      const { token } = await registerUserAndGetToken();

      const createRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({
          name: "To Delete",
          currency: "UAH",
        });

      const accountId = createRes.body.account.id;
      const accountDoc = await Account.findById(accountId);

      const category = await Category.create({
        userId: accountDoc.userId,
        name: "Food",
        type: "expense",
        icon: "🍔",
      });

      await Transaction.create({
        userId: accountDoc.userId,
        accountId,
        categoryId: category._id,
        amount: 150,
        description: "Lunch",
      });

      const beforeDeleteCount = await Transaction.countDocuments({ accountId });
      expect(beforeDeleteCount).toEqual(1);

      const res = await request(app)
        .delete(`/api/v1/accounts/${accountId}`)
        .set("Authorization", token);

      expect(res.statusCode).toEqual(204);

      const account = await Account.findById(accountId);
      const afterDeleteCount = await Transaction.countDocuments({ accountId });

      expect(account).toBeNull();
      expect(afterDeleteCount).toEqual(0);
    });

    it("should return 404 when deleting non-existing account", async () => {
      const { token } = await registerUserAndGetToken();
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .delete(`/api/v1/accounts/${nonExistingId}`)
        .set("Authorization", token);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("detail", "Account not found");
    });
  });
});
