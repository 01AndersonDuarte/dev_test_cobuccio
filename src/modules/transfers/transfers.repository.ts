import { BadRequestException, Injectable } from '@nestjs/common';

import { Transfer } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateTransferInput } from './input/create-transfer.input.js';
import { AuthenticatedUser } from '../../guards/types/authenticated-user.js';

@Injectable()
export class TransfersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getTransferById(transferId: string): Promise<Transfer | null> {
    return await this.prisma.transfer.findUnique({
      where: { id: transferId },
    });
  }

  async findByIdempotencyKey(key: string): Promise<Transfer | null> {
    return await this.prisma.transfer.findUnique({
      where: { idempotencyKey: key },
    });
  }

  async createTransfer(
    createdTransfer: CreateTransferInput,
  ): Promise<Transfer> {
    const { amount, receiverId, senderId } = createdTransfer;

    return this.prisma.$transaction(async (txClient) => {
      const transfer = await txClient.transfer.create({
        data: createdTransfer,
      });

      const debit = await txClient.wallet.updateMany({
        where: {
          userId: senderId,
          balance: { gte: amount },
        },
        data: {
          balance: { decrement: amount },
        },
      });

      if (debit.count !== 1) {
        throw new BadRequestException('Insufficient balance');
      }

      await txClient.wallet.update({
        where: { userId: receiverId },
        data: {
          balance: { increment: amount },
        },
      });

      return transfer;
    });
  }
}
