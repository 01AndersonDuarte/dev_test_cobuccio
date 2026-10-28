import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

import { SigninDto, SignupDto } from './dto/signup.dto.js';
import { UsersService } from '../users/users.service.js';
import { CreateUserInput } from '../users/inputs/create-user.input.js';
import { User } from '../../generated/prisma/browser.js';

@Injectable()
export class AuthService {
  private readonly EXPIRATION_TIME = '3 days';
  private readonly ISSUER = 'dev_test_cobuccio';
  private readonly AUDIENCE = 'users';

  private readonly CRYPT = 10;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async signup(newUser: SignupDto) {
    const newUserInput: CreateUserInput = {
      ...newUser,
      password: await bcrypt.hash(newUser.password, this.CRYPT),
    };

    return await this.usersService.createUser(newUserInput);
  }

  async signin(userSigninData: SigninDto) {
    const { email, password } = userSigninData;

    const user = await this.usersService.findUserByEmail(email);

    if (!user) {
      this.logger.warn('Authentication failed');
      throw new UnauthorizedException('Something is wrong.');
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      this.logger.warn('Authentication failed');
      throw new UnauthorizedException('Something is wrong.');
    }

    const accessToken = this.createToken(user);
    this.logger.log(`User ${user.id} authenticated successfully`);

    return { accessToken };
  }

  private createToken(user: User): string {
    const { id, email } = user;

    const token = this.jwtService.sign(
      { email },
      {
        expiresIn: this.EXPIRATION_TIME,
        subject: id,
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
      },
    );

    return token;
  }

  checkToken(token: string): JwtPayload {
    const data = this.jwtService.verify<JwtPayload>(token, {
      audience: this.AUDIENCE,
      issuer: this.ISSUER,
    });

    return data;
  }
}
