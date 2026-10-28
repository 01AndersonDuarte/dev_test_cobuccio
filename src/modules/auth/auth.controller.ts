import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { SigninDto, SignupDto } from './dto/signup.dto.js';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiResponse({
    status: 200,
    description:
      'Registration request processed. For security reasons, the response does not disclose whether the account already exists.',
  })
  async signup(@Body() newUser: SignupDto) {
    return await this.authService.signup(newUser);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate a user and generate a JWT token' })
  @ApiResponse({
    status: 200,
    description: 'User authenticated successfully. Returns a JWT token.',
  })
  async signin(@Body() userSigninData: SigninDto) {
    return await this.authService.signin(userSigninData);
  }
}
