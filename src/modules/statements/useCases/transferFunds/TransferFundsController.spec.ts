import request from "supertest";
import { Connection, } from "typeorm";

import createConnection from '../../../../database'
import { app } from "../../../../app";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";
import { User } from "../../../users/entities/User";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { IStatementsRepository } from "@modules/statements/repositories/IStatementsRepository";
import { UsersRepository } from "@modules/users/repositories/UsersRepository";
import { StatementsRepository } from "@modules/statements/repositories/StatementsRepository";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

let connection: Connection;
let usersRepository: IUsersRepository
let statementsRepository: IStatementsRepository
let userSend: User;
let userSendPassword: string
let userReceiver: User;

describe("Transfer Funds Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    usersRepository = new UsersRepository();
    statementsRepository = new StatementsRepository();

    userSendPassword = 'Inaas'
    userSend = await usersRepository.create({
      email: 'toguvoru@koczekune.hk',
      name: 'Ina Fields',
      password: await hash(userSendPassword, 8)
    })

    await statementsRepository.create({
      user_id: userSend.id,
      amount: 900,
      description: 'Salario',
      type: OperationType.DEPOSIT
    })

    userReceiver = await usersRepository.create({
      email: 'otiognac@umobnoh.im',
      name: 'Daisy Bishop',
      password: await hash('Daisys', 8)
    })
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to transfer funds", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: userSend.email,
      password: userSendPassword,
    });

    const { token } = responseToken.body;

    const response = await request(app).post(
      `/api/v1/statements/transfers/${userReceiver.id}`
    )
      .send({
        amount: 510,
        description: "Ajuda financeira"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const responseBalance = await request(app).get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { sender_id, amount, description, type } = response.body
    const { balance } = responseBalance.body

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('sender_id')
    expect(amount).toBe(510)
    expect(description).toBe('Ajuda financeira')
    expect(type).toBe("transfer")
    expect(sender_id).toBe(userSend.id)
    expect(balance).toBe(390)
  });


  it("should not be able to transfer funds an nonexistent user", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: userSend.email,
      password: userSendPassword,
    });

    const { token } = responseToken.body;
    const fakeUserId = uuidV4();

    const response = await request(app).post(
      `/api/v1/statements/transfers/${fakeUserId}`
    )
      .send({
        amount: 100,
        description: "Transferencia para usuario inexistente"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });


    expect(response.statusCode).toBe(404)
    expect(response.body).toHaveProperty('message')
  });

  it("should not be able to transfer insufficient funds", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: userSend.email,
      password: userSendPassword,
    });

    const { token } = responseToken.body;


    const response = await request(app).post(
      `/api/v1/statements/transfers/${userReceiver.id}`
    )
      .send({
        amount: 130000,
        description: "Tentativa de transferir um Civic 2022"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });


    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('message')
  });

  it("should not be able to transfer funds an user unauthenticated", async () => {
    const fakerToken = uuidV4()

    const response = await request(app).post(
      `/api/v1/statements/transfers/${userReceiver.id}`
    )
      .send({
        amount: 130,
        description: "Tentativa de transferir sem usuario"
      })
      .set({
        Authorization: `Bearer ${fakerToken}`,
      });


    expect(response.statusCode).toBe(401)
    expect(response.body).toHaveProperty('message')
  });
});
