import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { User as UserDecorator } from '../../decorators/user.decorator.js';
import type { AuthenticatedUser } from '../../guards/types/authenticated-user.js';
import { AuthGuard } from '../../guards/auth.guard.js';
import { WalletService } from './wallet.service.js';
import { WalletResponseDto } from './dto/wallet-response.dto.js';
import { WalletDepositDto } from './dto/wallet-deposit.dto.js';
import {
  ApiWalletDeposit,
  ApiWalletMe,
} from './decorators/wallet.decorator.js';

@ApiBearerAuth('bearer')
@Controller('wallet')
@UseGuards(AuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('/me')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: WalletResponseDto,
    excludeExtraneousValues: true,
  })
  @ApiWalletMe()
  async getMyWallet(@UserDecorator() user: AuthenticatedUser) {
    return await this.walletService.getMyWallet(user);
  }

  @Post('/deposit')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: WalletResponseDto,
    excludeExtraneousValues: true,
  })
  @ApiWalletDeposit()
  async deposit(
    @UserDecorator() user: AuthenticatedUser,
    @Body() depositData: WalletDepositDto,
  ) {
    const { amount } = depositData;
    return await this.walletService.depositToWallet(user, amount);
  }
}
