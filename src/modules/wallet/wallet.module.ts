import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';

import { WalletController } from './wallet.controller.js';
import { WalletService } from './wallet.service.js';
import { WalletRepository } from './wallet.repository.js';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule],
  controllers: [WalletController],
  providers: [WalletService, WalletRepository],
})
export class WalletModule {}
