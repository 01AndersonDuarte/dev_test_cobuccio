import { faker } from '@faker-js/faker';

import { TransferDto } from '../../src/modules/transfers/dto/transfers.dto.js';

export class TransfersFactory {
  private amount: number;
  private receiverId: string;
  private idempotencyKey: string;

  build(): TransferDto {
    return {
      amount: this.amount,
      receiverId: this.receiverId,
      idempotencyKey: this.idempotencyKey,
    };
  }

  async randomBuild(receiverId: string) {
    this.amount = faker.number.int({ min: 1, max: 100_000 });
    this.receiverId = receiverId;
    this.idempotencyKey = faker.string.uuid();

    return this.build();
  }
}
