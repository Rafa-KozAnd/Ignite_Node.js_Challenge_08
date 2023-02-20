import request from "supertest";
import { Connection, getRepository, Repository } from "typeorm";

import createConnection from '../../../../database'
import { app } from "../../../../app";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";
import { Statement } from "../../entities/Statement";
import { User } from "../../../users/entities/User";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Balance Controller", () => {
  let connection: Connection;

  let repositoryUser: Repository<User>
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("user123", 8);

    const repositoryStatement = getRepository(Statement)
    repositoryUser = getRepository(User)

    await connection.query(
      `INSERT INTO users(id, name, email, password)
    values ('${id}', 'user Show', 'user@get.balance.com', '${password}')`
    );

    const statementDeposit = repositoryStatement.create({
      user_id: id,
      amount: 150,
      description: 'Venda de caldo de cana',
      type: OperationType.DEPOSIT
    });

    const statementWithdraw = repositoryStatement.create({
      user_id: id,
      amount: 45,
      description: 'Pagar conta',
      type: OperationType.WITHDRAW
    });

    await repositoryStatement.save(statementDeposit);
    await repositoryStatement.save(statementWithdraw);
    const statement: Statement[] = []

    statement.push(repositoryStatement.create({
      amount: 900,
      description: 'Precatoria',
      type: OperationType.DEPOSIT
    }))

    statement.push(repositoryStatement.create({
      amount: 500,
      description: 'Pagar conta',
      type: OperationType.WITHDRAW
    }))

    const userAsDeleted = repositoryUser.create({
      name: "User as Deleted",
      email: "user.deleted@get.balance.com",
      password: await hash("user123", 8),
      statement
    })

    await repositoryUser.save(userAsDeleted)
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get balance an user", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@get.balance.com",
      password: "user123",
    });

    const { token } = responseToken.body;

    const response = await request(app).get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { balance, statement } = response.body

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('balance')
    expect(response.body).toHaveProperty('statement')
    expect(balance).toBe(105)
    expect(statement.length).toBe(2)
  });

  it("should not be able to get balance an nonexists user", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user.deleted@get.balance.com",
      password: "user123",
    });

    const { token, user: { id } } = responseToken.body;

    await repositoryUser.delete(id)

    const response = await request(app).get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toBe(404)
    expect(response.body).toHaveProperty('message')
  });
});
