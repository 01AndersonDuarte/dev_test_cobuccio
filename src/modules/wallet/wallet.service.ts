import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { AuthenticatedUser } from '../../guards/types/authenticated-user.js';
import { WalletRepository } from './wallet.repository.js';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private readonly walletRepository: WalletRepository) {}

  async getMyWallet(user: AuthenticatedUser) {
    const userWallet = await this.walletRepository.getMyWallet(user.id);

    if (!userWallet) {
      this.logger.error('Wallet not found for the user.');
      throw new NotFoundException('Wallet not found for the user.');
    }

    return userWallet;
  }

  async depositToWallet(user: AuthenticatedUser, amount: number) {
    const userWallet = await this.getMyWallet(user);
    const newBalance = userWallet.balance + amount;

    const updatedWallet = await this.walletRepository.updateWalletBalance(
      user.id,
      newBalance,
    );

    this.logger.log('Wallet balance updated successfully.');

    return updatedWallet;
  }
}
