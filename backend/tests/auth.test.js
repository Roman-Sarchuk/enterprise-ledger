const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryReplSet } = require("mongodb-memory-server");
const User = require("../models/User");
const { Category } = require("../models/Category");

// Mock sendEmail before loading app so services/controllers get the mock
jest.mock("../utils/sendEmail");
const sendEmail = require("../utils/sendEmail");
const app = require("../app");

let mongoServer;
require('dotenv').config();


describe("Auth API", () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'DwD6fjjd2BLTBazHZt9ZTRs7VPpNtfHT7CMdpMxb2Y4'; // Set a test JWT secret
    mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
    ]);
    if (sendEmail && sendEmail.mockClear) sendEmail.mockClear();
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe("POST /api/v1/auth/register", () => {
    it("should register a new user with valid data (201)", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({
        name: "Test User 1",
        email: "user@example.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body.user).toHaveProperty("email", "user@example.com");
      expect(res.body).toHaveProperty("token");

      const user = await User.findOne({ email: "user@example.com" });
      const systemCategories = await Category.find({
        userId: user._id,
        isSystem: true,
      }).sort({ type: 1 });

      expect(systemCategories).toHaveLength(2);
      expect(systemCategories[0]).toHaveProperty("name", "Expense");
      expect(systemCategories[0]).toHaveProperty("type", "expense");
      expect(systemCategories[0]).toHaveProperty("icon", "💸");
      expect(systemCategories[0]).toHaveProperty("isSystem", true);
      expect(systemCategories[1]).toHaveProperty("name", "Income");
      expect(systemCategories[1]).toHaveProperty("type", "income");
      expect(systemCategories[1]).toHaveProperty("icon", "💰");
      expect(systemCategories[1]).toHaveProperty("isSystem", true);
    });

    it("should return 400 if email is missing", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({
        name: "No Email User",
        email: "",
        password: "password123",
      });

      console.log(res.body);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail");
    });

    it("should return 409 if email is already taken", async () => {
      await request(app).post("/api/v1/auth/register").send({
        name: "Original User",
        email: "user@example.com",
        password: "password123",
      });

      const res = await request(app).post("/api/v1/auth/register").send({
        name: "Duplicate User",
        email: "user@example.com",
        password: "password321",
      });

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty("detail");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should login with correct credentials (200)", async () => {
      await request(app).post("/api/v1/auth/register").send({
        name: "Test User 1",
        email: "user@example.com",
        password: "password123",
      });

      const res = await request(app).post("/api/v1/auth/login").send({
        email: "user@example.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.user).toHaveProperty("name", "Test User 1");
      expect(res.body).toHaveProperty("token");
    });

    it("should return 400 if email is missing", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "",
        password: "password123",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail");
    });

    it("should return 401 if password or email is incorrect", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "user@example.com",
        password: "wrongpassword",
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("detail");
    });
  });

  describe("POST /api/v1/auth/forgot-password", () => {
    it("should generate token and send email for valid user (200)", async () => {
      // Спочатку створюємо користувача
      await request(app).post("/api/v1/auth/register").send({
        name: "Test User",
        email: "forgot@example.com",
        password: "password123",
      });

      const res = await request(app).post("/api/v1/auth/forgot-password").send({
        email: "forgot@example.com",
      });

      expect(res.statusCode).toEqual(200);
      // service now returns a generic message to prevent user enumeration
      expect(res.body).toHaveProperty("message", "If an account with that email exists, a password reset link has been sent.");

      // Перевіряємо, чи зберігся токен в БД
      const user = await User.findOne({ email: "forgot@example.com" });
      expect(user.resetPasswordToken).toBeDefined();
      expect(user.resetPasswordExpire).toBeDefined();
    });

    it("should return 400 if email is missing", async () => {
      const res = await request(app).post("/api/v1/auth/forgot-password").send({
        email: "",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail");
    });

    it("should return generic 200 response if user does not exist", async () => {
      const res = await request(app).post("/api/v1/auth/forgot-password").send({
        email: "nonexistent@example.com",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("message", "If an account with that email exists, a password reset link has been sent.");
    });
  });

  describe("POST /api/v1/auth/reset-password/:token", () => {
    let validToken;

    beforeEach(async () => {
      // Створюємо користувача та генеруємо йому токен перед кожним тестом
      await request(app).post("/api/v1/auth/register").send({
        name: "Reset User",
        email: "reset@example.com",
        password: "oldpassword",
      });

      await request(app).post("/api/v1/auth/forgot-password").send({
        email: "reset@example.com",
      });

      // Extract raw token from mocked sendEmail call (it contains the URL)
      const call = sendEmail.mock.calls[0];
      const sent = call && call[0] ? call[0] : null;
      let rawToken = null;
      if (sent && sent.message) {
        const m = sent.message.match(/reset-password\/(\w+)/i);
        if (m) rawToken = m[1];
      }

      // rawToken is what must be provided to the reset endpoint
      validToken = rawToken;
    });

    it("should reset password with valid token (200)", async () => {
      const res = await request(app).post(`/api/v1/auth/reset-password/${validToken}`).send({
        password: "newpassword123",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("message", "Password reset successfully");

      // Перевіряємо, чи очистилися поля токена
      const user = await User.findOne({ email: "reset@example.com" });
      expect(user.resetPasswordToken).toBeUndefined();
      expect(user.resetPasswordExpire).toBeUndefined();

      // Перевіряємо, чи можемо увійти з новим паролем
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: "reset@example.com",
        password: "newpassword123",
      });
      expect(loginRes.statusCode).toEqual(200);
    });

    it("should return 400 if token is invalid", async () => {
      const res = await request(app).post("/api/v1/auth/reset-password/invalidtoken123").send({
        password: "newpassword123",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail", "Invalid or expired token");
    });

    it("should return 400 if token is expired", async () => {
      // Штучно робимо токен простроченим у БД
      const user = await User.findOne({ email: "reset@example.com" });
      user.resetPasswordExpire = new Date(Date.now() - 10000); // Час у минулому
      await user.save();

      const res = await request(app).post(`/api/v1/auth/reset-password/${validToken}`).send({
        password: "newpassword123",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail", "Invalid or expired token");
    });

    it("should return 400 if new password is missing", async () => {
      const res = await request(app).post(`/api/v1/auth/reset-password/${validToken}`).send({
        password: "",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail");
    });
  });
});
