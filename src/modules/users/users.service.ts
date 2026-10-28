import { Injectable } from '@nestjs/common';

import { UsersRepository } from './users.repository.js';
import { CreateUserInput } from './inputs/create-user.input.js';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(userInput: CreateUserInput) {
    const { email, cpf } = userInput;

    const userFilteredByEmail = await this.findUserByEmail(email);
    const userFilteredByCpf = await this.findUserByCpf(cpf);

    if (userFilteredByEmail || userFilteredByCpf) {
      return;
    }

    await this.usersRepository.createUser(userInput);
  }

  private async findUserByEmail(email: string) {
    return await this.usersRepository.findUserByEmail(email);
  }

  private async findUserByCpf(cpf: string) {
    return await this.usersRepository.findUserByCpf(cpf);
  }
}
