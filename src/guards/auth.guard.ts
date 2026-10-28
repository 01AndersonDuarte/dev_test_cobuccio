import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from '../modules/auth/auth.service.js';
import { UsersService } from '../modules/users/users.service.js';
import { AuthenticatedUser } from './types/authenticated-user.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { authorization } = request.headers;

    const token = authorization && authorization.split(' ')[1];
    if (!token) throw new UnauthorizedException();

    try {
      const data = this.authService.checkToken(token);

      const user = await this.usersService.findUserByEmail(data.email);
      if (!user) throw new UnauthorizedException();

      const authenticatedUser: AuthenticatedUser = {
        id: user.id,
        email: user.email,
      };

      response.locals.user = authenticatedUser;

      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
