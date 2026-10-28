import { Injectable } from '@nestjs/common';

import { AuthenticatedUser } from '../../guards/types/authenticated-user.js';
import { WalletRepository } from './wallet.repository.js';

@Injectable()
export class WalletService {
  constructor(private readonly walletRepository: WalletRepository) {}

  async getMyWallet(user: AuthenticatedUser) {
    const userWallet = await this.walletRepository.getMyWallet(user.id);
    if (!userWallet) {
      throw new Error('Wallet not found for the user.');
    }

    return userWallet;
  }
}
