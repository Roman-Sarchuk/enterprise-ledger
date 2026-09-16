const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const { MongoMemoryReplSet } = require("mongodb-memory-server");

const User = require("../models/User");
const { registerUserAndGetToken } = require("./helpers/authTestHelper");

let mongoServer;

require("dotenv").config();

describe("User API", () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = "DwD6fjjd2BLTBazHZt9ZTRs7VPpNtfHT7CMdpMxb2Y4"; // Set a test JWT secret
    mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  beforeEach(async () => {
    await Promise.all([User.deleteMany({})]);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe("DELETE /api/v1/users/me", () => {
    it("should return 204 No Content", async () => {
      const { token } = await registerUserAndGetToken();

      const res = await request(app)
        .delete("/api/v1/users/me")
        .set("Authorization", token);

      expect(res.statusCode).toEqual(204);
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app)
        .delete("/api/v1/users/me")
        .set("Authorization", "");

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("detail");
    });
  });

  describe("PATCH /api/v1/users/me", () => {
    it("should return 200 OK", async () => {
      const { token } = await registerUserAndGetToken();

      const res = await request(app)
        .patch("/api/v1/users/me")
        .set("Authorization", token)
        .send({
          name: "Updated User 3",
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.user).toHaveProperty("name", "Updated User 3");
    });

    it("should return 401 if no token provided", async () => {
      const res = await request(app)
        .patch("/api/v1/users/me")
        .set("Authorization", "");

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("detail");
    });

    it("should return 400 if invalid data provided", async () => {
      const { token } = await registerUserAndGetToken();

      const res = await request(app)
        .patch("/api/v1/users/me")
        .set("Authorization", token)
        .send({
          name: "",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("detail");
    });
  });
});
