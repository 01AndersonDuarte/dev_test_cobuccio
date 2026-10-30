import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { SigninDto, SignupDto } from './dto/signup.dto.js';
import { ApiAuthSigin, ApiAuthSignup } from './decorators/auth.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  @ApiAuthSignup()
  async signup(@Body() newUser: SignupDto) {
    return await this.authService.signup(newUser);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiAuthSigin()
  async signin(@Body() userSigninData: SigninDto) {
    return await this.authService.signin(userSigninData);
  }
}
