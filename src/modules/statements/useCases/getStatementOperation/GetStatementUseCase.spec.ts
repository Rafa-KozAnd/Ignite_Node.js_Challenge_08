import 'reflect-metadata'
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";
import { Statement } from "../../entities/Statement";
import { User } from "../../../users/entities/User";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { IStatementsRepository } from "@modules/statements/repositories/IStatementsRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { GetStatementOperationError } from './GetStatementOperationError';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let getStatementOperationUseCase: GetStatementOperationUseCase
let statementsRepository: IStatementsRepository
let usersRepository: IUsersRepository
let user: User;
let statementDeposit: Statement;
let statementWithdraw: Statement;

describe("Get Statement Controller", () => {

  beforeAll(async () => {
    statementsRepository = new InMemoryStatementsRepository()
    usersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    )

    user = await usersRepository.create({
      name: "User Comun",
      email: "user@exemplo.com",
      password: await hash("user123", 8),
    })

    statementDeposit = await statementsRepository.create({
      user_id: user.id,
      amount: 500,
      description: 'Venda de caldo de cana',
      type: OperationType.DEPOSIT
    });

    statementWithdraw = await statementsRepository.create({
      user_id: user.id,
      amount: 150,
      description: 'Pagar conta',
      type: OperationType.WITHDRAW
    });
  });

  it("should be able to get statement", async () => {
    const statement = await getStatementOperationUseCase.execute({
      user_id: user.id,
      statement_id: statementWithdraw.id
    })

    const { amount, description, type } = statement

    expect(statement).toHaveProperty('amount')
    expect(statement).toHaveProperty('description')
    expect(statement).toHaveProperty('type')
    expect(amount).toBe(150)
    expect(description).toBe("Pagar conta")
    expect(type).toBe('withdraw')
  });

  it("should not be able to get statement an nonexistent user", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: uuidV4(),
        statement_id: statementDeposit.id
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  });

  it("should not be able to get nonexistent statement", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: user.id,
        statement_id: uuidV4()
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  });
});
