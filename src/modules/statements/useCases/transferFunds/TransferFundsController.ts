import { Request, Response } from "express";
import { container } from "tsyringe";
import { TransferFundsUseCase } from "./TransferFundsUseCase";

class TransferFundsController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { amount, description } = request.body
    const { user_id: receiver_id } = request.params
    const { id: sender_id } = request.user
    const transferFundsUseCase = container.resolve(TransferFundsUseCase)

    const transfer = await transferFundsUseCase.execute({
      sender_id,
      receiver_id,
      amount,
      description
    })

    return response.status(201).json(transfer)
  }
}

export { TransferFundsController }
