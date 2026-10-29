import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';

import { TransfersRepository } from './transfers.repository.js';
import { AuthenticatedUser } from '../../guards/types/authenticated-user.js';
import { TransferDto } from './dto/transfers.dto.js';
import { CreateTransferInput } from './input/create-transfer.input.js';
import { Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class TransfersService {
  private readonly logger = new Logger(TransfersService.name);

  constructor(private readonly transfersRepository: TransfersRepository) {}

  async createTransfer(user: AuthenticatedUser, transferData: TransferDto) {
    const { receiverId } = transferData;

    if (receiverId === user.id) {
      this.logger.warn('Self-transfer attempt rejected');
      throw new BadRequestException('Invalid transfer');
    }

    const createdTransfer: CreateTransferInput = {
      ...transferData,
      senderId: user.id,
    };

    try {
      const transfer =
        await this.transfersRepository.createTransfer(createdTransfer);

      this.logger.log(`Transfer completed: ${transfer.id}`);

      return transfer;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const transfer = await this.verifyTransferIdempotency(createdTransfer);

        if (transfer) {
          this.logger.log(`Idempotent transfer replay: ${transfer.id}`);

          return transfer;
        }
      }

      throw error;
    }
  }

  async getTransferById(transferId: string) {
    return await this.transfersRepository.getTransferById(transferId);
  }

  private async verifyTransferIdempotency(
    createdTransfer: CreateTransferInput,
  ) {
    const { idempotencyKey, senderId, receiverId, amount } = createdTransfer;

    const transfer =
      await this.transfersRepository.findByIdempotencyKey(idempotencyKey);

    if (transfer) {
      if (
        transfer.senderId !== senderId ||
        transfer.receiverId !== receiverId ||
        transfer.amount !== amount
      ) {
        this.logger.warn('Idempotency key conflict');
        throw new ConflictException('Idempotency key already used');
      }

      return transfer;
    }
  }
}
