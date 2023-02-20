import request from "supertest";
import { Connection, getRepository, Repository } from "typeorm";

import createConnection from '../../../../database'
import { app } from "../../../../app";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";
import { Statement } from "../../entities/Statement";
import { User } from "../../../users/entities/User";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Statement Controller", () => {
  let connection: Connection;

  let repositoryUser: Repository<User>
  let withdrawId: string | undefined;
  let userData: ICreateUserDTO;

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const repositoryStatement = getRepository(Statement)
    repositoryUser = getRepository(User)

    userData = {
      name: "User Statement",
      email: "user@statement.operation.com",
      password: "user123"
    }

    const user = repositoryUser.create({
      ...userData,
      password: await hash(userData.password, 8),
    })

    const statementDeposit = repositoryStatement.create({
      user,
      amount: 900,
      description: 'Precatoria',
      type: OperationType.DEPOSIT
    })

    const statementWithdraw = repositoryStatement.create({
      user,
      amount: 500,
      description: 'Pagar conta',
      type: OperationType.WITHDRAW
    })

    await repositoryUser.save(user)
    await repositoryStatement.save(statementWithdraw)
    await repositoryStatement.save(statementDeposit)

    withdrawId = statementWithdraw.id;

    const userDeleted = repositoryUser.create({
      name: "User Deleted",
      email: 'user.deleted@create.statement.com',
      password: await hash('user123', 8),
    })

    await repositoryUser.save(userDeleted)

  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: userData.email,
      password: userData.password,
    });

    const { token } = responseToken.body;

    const response = await request(app).get(`/api/v1/statements/${withdrawId}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { amount, description, type } = response.body

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('amount')
    expect(response.body).toHaveProperty('description')
    expect(response.body).toHaveProperty('type')
    expect(amount).toBe("500.00")
    expect(description).toBe("Pagar conta")
    expect(type).toBe('withdraw')
  });

  it("should not be able to get statement an nonexistent user", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user.deleted@create.statement.com",
      password: "user123",
    });

    const { token, user: { id } } = responseToken.body;

    repositoryUser.delete(id)

    const fakeStatementId = uuidV4()

    const response = await request(app).get(`/api/v1/statements/${fakeStatementId}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toBe(404)
    expect(response.body).toHaveProperty('message')
  });

  it("should not be able to get nonexistent statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: userData.email,
      password: userData.password,
    });

    const { token } = responseToken.body;

    const fakeStatementId = uuidV4()

    const response = await request(app).get(`/api/v1/statements/${fakeStatementId}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toBe(404)
    expect(response.body).toHaveProperty('message')
  });
});
