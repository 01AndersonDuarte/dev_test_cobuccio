import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUserInput } from './inputs/create-user.input.js';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(userInput: CreateUserInput) {
    return await this.prisma.user.create({
      data: {
        ...userInput,
        wallets: {
          create: { balance: 0 },
        },
      },
    });
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserByCpf(cpf: string) {
    return await this.prisma.user.findUnique({
      where: { cpf },
    });
  }
}
