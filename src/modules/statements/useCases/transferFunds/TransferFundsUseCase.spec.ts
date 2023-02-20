import { Statement } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "@modules/statements/repositories/IStatementsRepository";
import { User } from "@modules/users/entities/User"
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { hash } from "bcryptjs";
import { TransferFundsError } from "./TransferFundsError";
import { TransferFundsUseCase } from "./TransferFundsUseCase"

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

let transferFundsUseCase: TransferFundsUseCase
let usersRepository: IUsersRepository
let statementsRepository: IStatementsRepository
let userSend: User;
let userReceiver: User

describe('TransferFunds', () => {

  beforeAll(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    transferFundsUseCase = new TransferFundsUseCase(
      statementsRepository,
      usersRepository
    );

    userSend = await usersRepository.create({
      email: 'toguvoru@koczekune.hk',
      name: 'Ina Fields',
      password: await hash('Inaas', 8)
    })

    await statementsRepository.create({
      user_id: userSend.id,
      amount: 4500,
      description: 'Salario',
      type: OperationType.DEPOSIT
    })

    userReceiver = await usersRepository.create({
      email: 'otiognac@umobnoh.im',
      name: 'Daisy Bishop',
      password: await hash('Daisys', 8)
    })
  })

  it('should be able to transfer funds', async () => {
    const statementTransfer = await transferFundsUseCase.execute({
      sender_id: userSend.id,
      receiver_id: userReceiver.id,
      amount: 400,
      description: 'Peça para notebook'
    })

    const balanceSend = await statementsRepository.getUserBalance({
      user_id: userSend.id,
      with_statement: true
    }) as { balance: number, statement: Statement[] }

    const balanceReceiver = await statementsRepository.getUserBalance({
      user_id: userReceiver.id,
      with_statement: true
    }) as { balance: number, statement: Statement[] }

    expect(statementTransfer).toMatchObject({
      sender_id: userSend.id,
      user_id: userReceiver.id,
      amount: 400,
      description: 'Peça para notebook',
      type: OperationType.TRANSFER
    });

    expect(balanceSend.balance).toBe(4100)
    expect(balanceSend.statement.length).toBe(2)

    expect(balanceReceiver.balance).toBe(400)
    expect(balanceReceiver.statement.length).toBe(1)
  })

  it('should not be able to transfer insufficient funds', async () => {
    await expect(async () => {
      await transferFundsUseCase.execute({
        sender_id: userSend.id,
        receiver_id: 'nonexists-user',
        amount: 40000,
        description: 'Chaçara'
      })
    }).rejects.toBeInstanceOf(TransferFundsError.InsufficientFunds)
  })

  it('should not be able to transfer funds nonexists users', async () => {
    await expect(async () => {
      await transferFundsUseCase.execute({
        sender_id: userSend.id,
        receiver_id: 'nonexists-user',
        amount: 400,
        description: 'Peça para notebook'
      })
    }).rejects.toBeInstanceOf(TransferFundsError.UserNotFound)
  })
})
