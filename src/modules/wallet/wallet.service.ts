import { BadRequestException, Injectable, Logger } from '@nestjs/common';

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
      throw new BadRequestException('Wallet not found for the user.');
    }

    return userWallet;
  }
}
