import request from "supertest";
import { Connection, getConnection } from "typeorm";

import createConnection from '../../../../database/'
import { app } from "../../../../app";

describe("Create User Controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new User", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "admin",
      email: "admin@rentx.com.br",
      password: "admin",
    });

    expect(response.statusCode).toBe(201)
  });

  it("should not be able to create a new User with name email", async () => {
    await request(app).post("/api/v1/users").send({
      name: "User teste 1",
      email: "same.email@exemplo.com",
      password: "654321",
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "User teste 2",
      email: "same.email@exemplo.com",
      password: "123456",
    });

    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('message')
  });
});
