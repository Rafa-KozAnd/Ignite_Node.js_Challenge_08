import 'reflect-metadata'

import { hash } from "bcryptjs";
import { User } from "../../../users/entities/User";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { IStatementsRepository } from "@modules/statements/repositories/IStatementsRepository";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { v4 as uuidV4 } from 'uuid';
import { CreateStatementError } from './CreateStatementError';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let createStatementUseCase: CreateStatementUseCase
let statementsRepository: IStatementsRepository
let usersRepository: IUsersRepository
let user: User;

describe("Create Statment", () => {
  beforeAll(async () => {
    statementsRepository = new InMemoryStatementsRepository()
    usersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    )

    user = await usersRepository.create({
      name: "User Create Statement",
      email: "user@create.statement.com",
      password: await hash("user123", 8),
    })

  });

  it("should be able to create statement deposit", async () => {
    const statementDeposit = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 510,
      description: 'Venda de pastel'
    })

    expect(statementDeposit).toHaveProperty('amount')
    expect(statementDeposit).toHaveProperty('type')
    expect(statementDeposit).toHaveProperty('description')
    expect(statementDeposit.amount).toBe(510)
    expect(statementDeposit.description).toBe('Venda de pastel')
    expect(statementDeposit.type).toBe("deposit")
  });

  it("should be able to create statement withdraw", async () => {
    const statementDeposit = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.WITHDRAW,
      amount: 100,
      description: 'Compra de massa para pastel'
    })

    expect(statementDeposit).toHaveProperty('amount')
    expect(statementDeposit).toHaveProperty('type')
    expect(statementDeposit).toHaveProperty('description')
    expect(statementDeposit.amount).toBe(100)
    expect(statementDeposit.description).toBe('Compra de massa para pastel')
    expect(statementDeposit.type).toBe("withdraw")
  });

  it("should not be able to create statement an nonexistent user", async () => {

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: uuidV4(),
        type: OperationType.WITHDRAW,
        amount: 100,
        description: 'Compra de massa para pastel'
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  });

  it("should not be able to  create statement insufficient funds", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.WITHDRAW,
        amount: 139000,
        description: 'Tentativa de compra de um CIVIC 2022'
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  });
});
