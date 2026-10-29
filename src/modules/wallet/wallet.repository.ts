import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class WalletRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getMyWallet(userId: string) {
    return await this.prisma.wallet.findUnique({
      where: { userId },
    });
  }

  async updateWalletBalance(userId: string, newBalance: number) {
    return await this.prisma.wallet.update({
      where: { userId },
      data: { balance: newBalance },
    });
  }
}
