import { Response } from 'express';
import {
  ExecutionContext,
  NotFoundException,
  createParamDecorator,
} from '@nestjs/common';
import { AuthenticatedUser } from '../guards/types/authenticated-user.js';

export const User = createParamDecorator(
  (data: string, context: ExecutionContext): AuthenticatedUser => {
    const response: Response = context.switchToHttp().getResponse();
    if (!response.locals.user) {
      throw new NotFoundException('User not found.');
    }

    return response.locals.user as AuthenticatedUser;
  },
);
