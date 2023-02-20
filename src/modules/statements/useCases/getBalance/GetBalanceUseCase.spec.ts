import 'reflect-metadata'

import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";
import { User } from "../../../users/entities/User";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { IStatementsRepository } from "@modules/statements/repositories/IStatementsRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { GetBalanceError } from './GetBalanceError';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let getBalanceUseCase: GetBalanceUseCase
let statementsRepository: IStatementsRepository
let usersRepository: IUsersRepository
let user: User;

describe("Get Balance", () => {
  beforeAll(async () => {
    statementsRepository = new InMemoryStatementsRepository()
    usersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    )

    user = await usersRepository.create({
      name: "User Comun",
      email: "user@exemplo.com",
      password: await hash("user123", 8),
    })

    await statementsRepository.create({
      user_id: user.id,
      amount: 150,
      description: 'Venda de caldo de cana',
      type: OperationType.DEPOSIT
    });

    await statementsRepository.create({
      user_id: user.id,
      amount: 45,
      description: 'Pagar conta',
      type: OperationType.WITHDRAW
    });
  });

  it("should be able to get balance an user", async () => {
    const userBalance = await getBalanceUseCase.execute({
      user_id: user.id
    })

    const { balance, statement } = userBalance

    expect(userBalance).toHaveProperty('balance')
    expect(userBalance).toHaveProperty('statement')
    expect(balance).toBe(105)
    expect(statement.length).toBe(2)
  });

  it("should not be able to get balance an nonexists user", async () => {
    expect(async () => {
      const fakeUserId = uuidV4()
      await getBalanceUseCase.execute({
        user_id: fakeUserId
      })
    }).rejects.toBeInstanceOf(GetBalanceError)
  });
});
