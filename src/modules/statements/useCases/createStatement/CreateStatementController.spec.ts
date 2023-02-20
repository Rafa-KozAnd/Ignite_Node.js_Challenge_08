import request from "supertest";
import { Connection, getRepository, Repository } from "typeorm";

import createConnection from '../../../../database'
import { app } from "../../../../app";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";
import { User } from "../../../users/entities/User";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Create Statment Controller", () => {
  let connection: Connection;
  let repositoryUser: Repository<User>
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("user123", 8);

    repositoryUser = getRepository(User)

    await connection.query(
      `INSERT INTO users(id, name, email, password)
    values ('${id}', 'user Show', 'user@create.statement.com', '${password}')`
    );

    const userDeleted = repositoryUser.create({
      name: "User as deleted",
      email: "user.deleted@create.statement.com",
      password: await hash("user123", 8)
    })

    repositoryUser.save(userDeleted)

  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create statement deposit", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@create.statement.com",
      password: "user123",
    });

    const { token } = responseToken.body;

    const response = await request(app).post("/api/v1/statements/deposit")
      .send({
        amount: 510,
        description: "Venda de pastel"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { amount, description, type } = response.body

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('amount')
    expect(response.body).toHaveProperty('description')
    expect(amount).toBe(510)
    expect(description).toBe('Venda de pastel')
    expect(type).toBe("deposit")
  });

  it("should be able to create statement withdraw", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@create.statement.com",
      password: "user123",
    });

    const { token } = responseToken.body;

    const response = await request(app).post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "Compra de massa para pastel"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { amount, description, type } = response.body

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('amount')
    expect(response.body).toHaveProperty('description')
    expect(amount).toBe(100)
    expect(description).toBe("Compra de massa para pastel")
    expect(type).toBe("withdraw")

  });

  it("should not be able to create statement an nonexistent user", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user.deleted@create.statement.com",
      password: "user123",
    });

    const { token, user: { id } } = responseToken.body;

    repositoryUser.delete(id)

    const response = await request(app).post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "Compra de massa para pastel"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });


    expect(response.statusCode).toBe(404)
    expect(response.body).toHaveProperty('message')
  });

  it("should not be able to  create statement insufficient funds", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@create.statement.com",
      password: "user123",
    });

    const { token } = responseToken.body;


    const response = await request(app).post("/api/v1/statements/withdraw")
      .send({
        amount: 130000,
        description: "Tentativa de compra de um Civic 2022"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });


    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('message')
  });
});
