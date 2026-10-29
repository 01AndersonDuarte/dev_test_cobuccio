import { Module } from '@nestjs/common';

import { TransfersController } from './transfers.controller.js';
import { TransfersRepository } from './transfers.repository.js';
import { TransfersService } from './transfers.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';
import { ReversalService } from './reversals.service.js';
import { ReversalRepository } from './reversals.repository.js';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule],
  controllers: [TransfersController],
  providers: [
    TransfersService,
    TransfersRepository,
    ReversalService,
    ReversalRepository,
  ],
})
export class TransfersModule {}
