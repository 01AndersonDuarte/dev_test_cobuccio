import { faker } from '@faker-js/faker';
import { WalletDepositDto } from '../../src/modules/wallet/dto/wallet-deposit.dto.js';

export class WalletFactory {
  private amount: number;

  build(): WalletDepositDto {
    return {
      amount: this.amount,
    };
  }

  async randomBuild() {
    this.amount = faker.number.int({ min: 1, max: 100_000 });
    return this.build();
  }
}
