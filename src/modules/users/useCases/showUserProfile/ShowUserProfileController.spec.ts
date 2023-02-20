import request from "supertest";
import { Connection } from "typeorm";

import createConnection from '../../../../database'
import { app } from "../../../../app";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

describe("Show User Profile Controller", () => {
  let connection: Connection;
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("user123", 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password)
    values ('${id}', 'user Show', 'user@show.com', '${password}')`
    );

    const idUser = uuidV4()

    await connection.query(
      `INSERT INTO users(id, name, email, password)
    values ('${idUser}', 'user as Delete', 'user.delete@show.com', '${password}')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show user profile", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@show.com",
      password: "user123",
    });

    const { token } = responseToken.body;

    const response = await request(app).get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('email')
    expect(response.body).toHaveProperty('name')
  });

  it("should not be able to show nonexists user profile", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user.delete@show.com",
      password: "user123",
    });

    const { token } = responseToken.body;

    await connection.query("DELETE FROM users WHERE email = 'user.delete@show.com'")

    const response = await request(app).get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toBe(404)
    expect(response.body).toHaveProperty('message')
  });
});
