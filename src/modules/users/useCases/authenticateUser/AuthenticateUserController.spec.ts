import request from "supertest";
import { Connection, getConnection } from "typeorm";

import createConnection from '../../../../database'
import { app } from "../../../../app";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

describe("Authenticate User Controller", () => {
  let connection: Connection;
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("user123", 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password)
    values ('${id}', 'user', 'user@exemplo.com', '${password}')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate an user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "user@exemplo.com",
      password: "user123",
    });

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('user')
    expect(response.body).toHaveProperty('token')
  });

  it("should not be able to authenticate an nonexists user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "User - 1",
      email: "user.email@exemplo.com",
      password: "654321",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "not.email@exemplo.com",
      password: "654321",
    });

    expect(response.statusCode).toBe(401)
    expect(response.body).toHaveProperty('message')

  });

  it("should not be able to authenticate with incorrect password", async () => {
    await request(app).post("/api/v1/users").send({
      name: "User - 1",
      email: "user.email@exemplo.com",
      password: "654321",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "user.email@exemplo.com",
      password: "7654321",
    });

    expect(response.statusCode).toBe(401)
    expect(response.body).toHaveProperty('message')
  });
});
