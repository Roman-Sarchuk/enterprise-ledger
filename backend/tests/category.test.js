const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryReplSet } = require("mongodb-memory-server");

const app = require("../app");
const User = require("../models/User");
const { Category } = require("../models/Category");
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const { registerUserAndGetToken } = require("./helpers/authTestHelper");

let mongoServer;

require("dotenv").config();

describe("Category API", () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = "DwD6fjjd2BLTBazHZt9ZTRs7VPpNtfHT7CMdpMxb2Y4";

    mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Transaction.deleteMany({}),
      Account.deleteMany({}),
    ]);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });                                                                                                                                                                                                                          

  describe("GET /api/v1/categories", () => {
    it("should return paginated categories for current user", async () => {
      const { token } = await registerUserAndGetToken();

      let postRes;
      postRes = await request(app).post("/api/v1/categories").set("Authorization", token).send({
        name: "Food",
        type: "expense",
        icon: "🍔",
      });
      expect(postRes.statusCode).toEqual(201);

      postRes = await request(app).post("/api/v1/categories").set("Authorization", token).send({
        name: "Salary",
        type: "income",
        icon: "💼",
      });
      expect(postRes.statusCode).toEqual(201);

      postRes = await request(app).post("/api/v1/categories").set("Authorization", token).send({
        name: "Transport",
        type: "expense",
        icon: "🚌",
      });
      expect(postRes.statusCode).toEqual(201);

      const res = await request(app)
        .get("/api/v1/categories?page=1&limit=2")
        .set("Authorization", token);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("categories");
      expect(Array.isArray(res.body.categories)).toBe(true);
      expect(res.body.categories.length).toEqual(2);
      expect(res.body.categories[0]).toHaveProperty("id");
      expect(res.body.categories[0]).toHaveProperty("name");
      expect(res.body.categories[0]).toHaveProperty("type");
      expect(res.body.categories[0]).toHaveProperty("icon");
    });

    it("should return 400 for invalid pagination", async () => {
      const { token } = await registerUserAndGetToken();

      const res = await request(app)
        .get("/api/v1/categories?page=0&limit=-1")
        .set("Authorization", token);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail", "Incorrect parameters");
      expect(res.body).toHaveProperty("error");
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app).get("/api/v1/categories").set("Authorization", "");

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("detail");
    });
  });

  describe("GET /api/v1/categories/:id", () => {
    it("should return category by id", async () => {
      const { token } = await registerUserAndGetToken();

      const createRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({
          name: "Food",
          type: "expense",
          icon: "🍔",
        });

      const categoryId = createRes.body.category.id;

      const res = await request(app)
        .get(`/api/v1/categories/${categoryId}`)
        .set("Authorization", token);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("category");
      expect(res.body.category).toHaveProperty("id", categoryId);
      expect(res.body.category).toHaveProperty("name", "Food");
      expect(res.body.category).toHaveProperty("type", "expense");
      expect(res.body.category).toHaveProperty("icon", "🍔");
    });

    it("should return 404 when category not found", async () => {
      const { token } = await registerUserAndGetToken();
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .get(`/api/v1/categories/${nonExistingId}`)
        .set("Authorization", token);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("detail", "Category not found");
    });
  });

  describe("POST /api/v1/categories", () => {
    it("should create category and return 201", async () => {
      const { token } = await registerUserAndGetToken();

      const res = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({
          name: "Bonus",
          type: "income",
          icon: "🎁",
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("category");
      expect(res.body.category).toHaveProperty("name", "Bonus");
      expect(res.body.category).toHaveProperty("type", "income");
      expect(res.body.category).toHaveProperty("icon", "🎁");
    });

    it("should return 400 for invalid type", async () => {
      const { token } = await registerUserAndGetToken();

      const res = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({
          name: "Crypto",
          type: "other",
          icon: "🪙",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail", "Incorrect parameters");
      expect(res.body).toHaveProperty("error");
    });

    it("should return 409 for duplicate category name", async () => {
      const { token } = await registerUserAndGetToken();

      await request(app).post("/api/v1/categories").set("Authorization", token).send({
        name: "Food",
        type: "expense",
        icon: "🍔",
      });

      const res = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({
          name: "Food",
          type: "income",
          icon: "🥗",
        });

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty("detail", "Category with this name already exists for user");
    });

    it("should return 400 for invalid icon", async () => {
      const { token } = await registerUserAndGetToken();

      const res = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({
          name: "Invalid Icon Category",
          type: "expense",
          icon: "not-an-emoji",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail", "Incorrect parameters");
      expect(res.body).toHaveProperty("error", "Invalid category icon");
    });
  });

  describe("PATCH /api/v1/categories/:id", () => {
    it("should update category fields", async () => {
      const { token } = await registerUserAndGetToken();

      const createRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Primary", type: "expense", icon: "📦" });

      const categoryId = createRes.body.category.id;

      const res = await request(app)
        .patch(`/api/v1/categories/${categoryId}`)
        .set("Authorization", token)
        .send({ name: "Primary Updated", type: "income", icon: "💡" });

      expect(res.statusCode).toEqual(200);
      expect(res.body.category).toHaveProperty("id", categoryId);
      expect(res.body.category).toHaveProperty("name", "Primary Updated");
      expect(res.body.category).toHaveProperty("type", "income");
      expect(res.body.category).toHaveProperty("icon", "💡");
    });

    it("should return 409 when updating to duplicate name", async () => {
      const { token } = await registerUserAndGetToken();

      const first = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "First", type: "expense", icon: "1️⃣" });

      await request(app).post("/api/v1/categories").set("Authorization", token).send({
        name: "Second",
        type: "income",
        icon: "2️⃣",
      });

      const res = await request(app)
        .patch(`/api/v1/categories/${first.body.category.id}`)
        .set("Authorization", token)
        .send({ name: "Second" });

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty("detail", "Category with this name already exists for user");
    });

    it("should return 400 for invalid type on update", async () => {
      const { token } = await registerUserAndGetToken();

      const createRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Editable", type: "expense", icon: "✏️" });

      const res = await request(app)
        .patch(`/api/v1/categories/${createRes.body.category.id}`)
        .set("Authorization", token)
        .send({ type: "other" });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail", "Incorrect parameters");
      expect(res.body).toHaveProperty("error", "Invalid category type");
    });

    it("should return 400 for invalid icon on update", async () => {
      const { token } = await registerUserAndGetToken();

      const createRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({ name: "Editable Icon", type: "expense", icon: "🛒" });

      const res = await request(app)
        .patch(`/api/v1/categories/${createRes.body.category.id}`)
        .set("Authorization", token)
        .send({ icon: "plain-text" });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail", "Incorrect parameters");
      expect(res.body).toHaveProperty("error", "Invalid category icon");
    });

    it("should return 404 when updating non-existing category", async () => {
      const { token } = await registerUserAndGetToken();
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .patch(`/api/v1/categories/${nonExistingId}`)
        .set("Authorization", token)
        .send({ name: "Updated" });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("detail", "Category not found");
    });

    it("should return 403 when updating a system category", async () => {
      const { token } = await registerUserAndGetToken();
      const user = await User.findOne({});
      const systemCategory = await Category.findOne({
        userId: user._id,
        name: "Expense",
        type: "expense",
        isSystem: true,
      });

      const res = await request(app)
        .patch(`/api/v1/categories/${systemCategory._id}`)
        .set("Authorization", token)
        .send({ name: "Edited default" });

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty("detail", "Default categories cannot be modified");
    });
  });

  describe("DELETE /api/v1/categories/:id", () => {
    it("should delete custom category and reassign transactions to matching system category", async () => {
      const { token } = await registerUserAndGetToken();
      const user = await User.findOne({});

      const accountRes = await request(app)
        .post("/api/v1/accounts")
        .set("Authorization", token)
        .send({
          name: "Main Account",
          currency: "USD",
        });

      const categoryRes = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", token)
        .send({
          name: "To Delete",
          type: "expense",
          icon: "🧾",
        });

      const categoryId = categoryRes.body.category.id;
      const accountId = accountRes.body.account.id;
      const categoryDoc = await Category.findById(categoryId);
      const defaultExpenseCategory = await Category.findOne({
        userId: user._id,
        type: "expense",
        isSystem: true,
      });

      await Transaction.create({
        userId: categoryDoc.userId,
        accountId,
        categoryId,
        amount: 250,
        description: "Groceries",
      });

      const beforeDeleteCount = await Transaction.countDocuments({ categoryId });
      expect(beforeDeleteCount).toEqual(1);

      const res = await request(app)
        .delete(`/api/v1/categories/${categoryId}`)
        .set("Authorization", token);

      expect(res.statusCode).toEqual(204);

      const category = await Category.findById(categoryId);
      const afterDeleteCount = await Transaction.countDocuments({ categoryId });
      const reassignedTransactions = await Transaction.find({
        categoryId: defaultExpenseCategory._id,
      });

      expect(category).toBeNull();
      expect(afterDeleteCount).toEqual(0);
      expect(reassignedTransactions).toHaveLength(1);
      expect(reassignedTransactions[0]).toHaveProperty("description", "Groceries");
    });

    it("should return 404 when deleting non-existing category", async () => {
      const { token } = await registerUserAndGetToken();
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .delete(`/api/v1/categories/${nonExistingId}`)
        .set("Authorization", token);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("detail", "Category not found");
    });

    it("should return 403 when deleting a system category", async () => {
      const { token } = await registerUserAndGetToken();
      const user = await User.findOne({});
      const systemCategory = await Category.findOne({
        userId: user._id,
        name: "Income",
        type: "income",
        isSystem: true,
      });

      const res = await request(app)
        .delete(`/api/v1/categories/${systemCategory._id}`)
        .set("Authorization", token);

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty("detail", "Default categories cannot be deleted");
    });
  });
});
