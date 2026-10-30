import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { WalletResponseDto } from '../dto/wallet-response.dto.js';

export function ApiWalletMe() {
  return applyDecorators(
    ApiOperation({ summary: 'Get the authenticated user wallet information' }),
    ApiResponse({
      status: 200,
      description: 'Returns the wallet information of the authenticated user.',
      type: WalletResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Missing or invalid authentication',
    }),
    ApiResponse({
      status: 404,
      description: 'Wallet not found.',
    }),
  );
}

export function ApiWalletDeposit() {
  return applyDecorators(
    ApiOperation({
      summary: 'Deposit funds into the authenticated user wallet',
    }),
    ApiResponse({
      status: 200,
      description: 'Deposits funds into the authenticated user wallet.',
      type: WalletResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Missing or invalid authentication',
    }),
  );
}
