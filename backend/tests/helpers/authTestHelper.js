const request = require("supertest");
const app = require("../../app");

const registerUserAndGetToken = async ({
  name = "Account Test User",
  email,
  password = "password123",
} = {}) => {
  const uniqueEmail = email || `account-${Date.now()}-${Math.random()}@example.com`;

  const registerRes = await request(app).post("/api/v1/auth/register").send({
    name,
    email: uniqueEmail,
    password,
  });

  expect(registerRes.statusCode).toEqual(201);
  expect(registerRes.body).toHaveProperty("token");

  return {
    token: registerRes.body.token,
  };
};

module.exports = {
  registerUserAndGetToken,
};
