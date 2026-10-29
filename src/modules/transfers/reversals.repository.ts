import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import { Reversal, Transfer } from '../../generated/prisma/client.js';

@Injectable()
export class ReversalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getReversalByTransferId(transferId: string): Promise<Reversal | null> {
    return await this.prisma.reversal.findUnique({ where: { transferId } });
  }

  async reverseTransfer(userId: string, transfer: Transfer): Promise<Reversal> {
    return this.prisma.$transaction(async (tx) => {
      const debit = await tx.wallet.updateMany({
        where: {
          userId,
          balance: { gte: transfer.amount },
        },
        data: {
          balance: { decrement: transfer.amount },
        },
      });

      if (debit.count !== 1) {
        throw new BadRequestException('Insufficient balance.');
      }

      await tx.wallet.update({
        where: { userId: transfer.senderId },
        data: {
          balance: { increment: transfer.amount },
        },
      });

      return tx.reversal.create({
        data: { transferId: transfer.id },
      });
    });
  }
}
