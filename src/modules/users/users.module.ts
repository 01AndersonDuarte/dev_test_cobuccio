import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module.js';
import { UsersService } from './users.service.js';
import { UsersRepository } from './users.repository.js';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
