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
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WalletDepositDto } from './dto/wallet-deposit.dto.js';

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
  @ApiOperation({ summary: 'Get the authenticated user wallet information' })
  @ApiResponse({
    status: 200,
    description: 'Returns the wallet information of the authenticated user.',
    type: WalletResponseDto,
  })
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
  @ApiOperation({ summary: 'Deposit funds into the authenticated user wallet' })
  @ApiResponse({
    status: 200,
    description: 'Deposits funds into the authenticated user wallet.',
    type: WalletResponseDto,
  })
  async deposit(
    @UserDecorator() user: AuthenticatedUser,
    @Body() depositData: WalletDepositDto,
  ) {
    const { amount } = depositData;
    return await this.walletService.depositToWallet(user, amount);
  }
}
