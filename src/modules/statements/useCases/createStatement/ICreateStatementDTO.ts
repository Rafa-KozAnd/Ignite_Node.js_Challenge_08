import { Statement } from "../../entities/Statement";

export type ICreateStatementDTO =
  Pick<
    Statement,
    'sender_id' |
    'user_id' |
    'description' |
    'amount' |
    'type'
  >
