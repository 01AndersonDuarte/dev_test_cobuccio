export class CreateTransferInput {
  amount: number;
  senderId: string;
  receiverId: string;
  idempotencyKey: string;
}
