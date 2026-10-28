import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { SignupDto } from './dto/signup.dto.js';
import { UsersService } from '../users/users.service.js';
import { CreateUserInput } from '../users/inputs/create-user.input.js';

@Injectable()
export class AuthService {
  private readonly CRYPT = 10;

  constructor(private readonly usersService: UsersService) {}

  async signup(newUser: SignupDto) {
    const newUserInput: CreateUserInput = {
      ...newUser,
      password: await bcrypt.hash(newUser.password, this.CRYPT),
    };

    return await this.usersService.createUser(newUserInput);
  }
}
