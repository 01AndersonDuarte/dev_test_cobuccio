import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

import { SignupDto } from '../../src/modules/auth/dto/signup.dto.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';

export class AuthFactory {
  private name: string;
  private cpf: string;
  private email: string;
  private password: string;

  constructor(private readonly prisma: PrismaService) {}

  setEmail(email: string) {
    this.email = email;
    return this;
  }

  setPassword(password: string) {
    this.password = password;
    return this;
  }

  build(): SignupDto {
    return {
      name: this.name,
      cpf: this.cpf,
      email: this.email,
      password: this.password,
    };
  }

  async randomBuild(persist: boolean = false) {
    this.name = faker.person.fullName();
    this.cpf = faker.string.numeric(11);
    this.setEmail(faker.internet.email());
    this.setPassword('P4s2word-2tR0ng');

    if (persist) await this.persist();

    return this.build();
  }

  async persist() {
    const user = this.build();
    return await this.prisma.user.create({
      data: { ...user, password: bcrypt.hashSync(user.password, 10) },
    });
  }
}
