import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUserInput } from './inputs/create-user.input.js';
import { User } from '../../generated/prisma/client.js';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(userInput: CreateUserInput): Promise<User> {
    return await this.prisma.user.create({
      data: {
        ...userInput,
        wallets: {
          create: { balance: 0 },
        },
      },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserByCpf(cpf: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { cpf },
    });
  }

  async findUserById(userId: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
}
