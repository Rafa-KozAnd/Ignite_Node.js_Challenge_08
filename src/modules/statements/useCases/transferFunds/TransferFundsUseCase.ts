import { Statement } from "@modules/statements/entities/Statement";
import { IStatementsRepository } from "@modules/statements/repositories/IStatementsRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { inject, injectable } from "tsyringe";
import { TransferFundsError } from "./TransferFundsError";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}

interface IRequest {
  sender_id: string,
  receiver_id: string,
  amount: number;
  description: string
}

@injectable()
class TransferFundsUseCase {
  constructor(
    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository,
    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {
    // Default
  }
  async execute({
    sender_id,
    receiver_id,
    amount,
    description
  }: IRequest): Promise<Statement> {
    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: sender_id
    })

    if (balance < amount) {
      throw new TransferFundsError.InsufficientFunds();
    }

    const userReceiver = await this.usersRepository.findById(receiver_id);

    if (!userReceiver) {
      throw new TransferFundsError.UserNotFound();
    }

    const statementTransfer = await this.statementsRepository.create({
      amount,
      description,
      type: OperationType.TRANSFER,
      user_id: userReceiver.id,
      sender_id
    });

    return statementTransfer;
  }
}
export { TransferFundsUseCase }
