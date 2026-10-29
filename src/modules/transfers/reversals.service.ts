import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { ReversalRepository } from './reversals.repository.js';
import { AuthenticatedUser } from '../../guards/types/authenticated-user.js';
import { TransfersService } from './transfers.service.js';
import { Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class ReversalService {
  private readonly logger = new Logger(ReversalService.name);

  constructor(
    private readonly reversalRepository: ReversalRepository,
    private readonly transfersService: TransfersService,
  ) {}

  async reverseTransfer(user: AuthenticatedUser, transferId: string) {
    const transfer = await this.transfersService.getTransferById(transferId);

    if (transfer?.receiverId !== user.id) {
      this.logger.warn(`Received transfer not found: ${transferId}`);
      throw new NotFoundException('Transfer not found.');
    }

    await this.checkReversalExists(transferId);

    try {
      await this.reversalRepository.reverseTransfer(user.id, transfer);

      this.logger.log(
        `Transfer reversal completed successfully: ${transferId}`,
      );

      return;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        await this.checkReversalExists(transferId);
      }

      throw error;
    }
  }

  async checkReversalExists(transferId: string) {
    const reversal =
      await this.reversalRepository.getReversalByTransferId(transferId);

    if (reversal) {
      this.logger.warn(`Transfer reversal conflict: ${transferId}`);
      throw new ConflictException('Already reversed.');
    }
  }
}
