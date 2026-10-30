import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiAuthSignup() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new user account' }),
    ApiResponse({
      status: 200,
      description:
        'Registration request processed. For security reasons, the response does not disclose whether the account already exists.',
    }),
  );
}

export function ApiAuthSigin() {
  return applyDecorators(
    ApiOperation({ summary: 'Authenticate a user and generate a JWT token' }),
    ApiResponse({
      status: 200,
      description: 'User authenticated successfully. Returns a JWT token.',
      schema: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
        required: ['accessToken'],
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid email or password format',
    }),
    ApiResponse({
      status: 401,
      description: 'Invalid email or password.',
    }),
  );
}
