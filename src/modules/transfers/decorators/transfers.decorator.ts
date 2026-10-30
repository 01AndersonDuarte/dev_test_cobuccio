import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import { TransferResponseDto } from '../dto/transfers-response.dto.js';

export function ApiCreateTransfer() {
  return applyDecorators(
    ApiOperation({ summary: 'Make a new transfer' }),
    ApiResponse({
      status: 201,
      description:
        'Transfer created, or existing transfer returned for an identical retry.',
      type: TransferResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Missing or invalid authentication.',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid request, self-transfer, or insufficient balance.',
    }),
    ApiResponse({
      status: 404,
      description: 'Receiver not found.',
    }),
    ApiResponse({
      status: 409,
      description:
        'Idempotency key was already used with different transfer data.',
    }),
  );
}

export function ApiCreateReversal() {
  return applyDecorators(
    ApiOperation({ summary: 'Reverse a transfer' }),
    ApiParam({
      name: 'id',
      description: 'UUID of the transfer to reverse.',
      type: String,
      format: 'uuid',
    }),
    ApiResponse({
      status: 200,
      description: 'Transfer reversed successfully. No response body.',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid transfer UUID or insufficient balance.',
    }),
    ApiResponse({
      status: 401,
      description:
        'Missing/invalid authentication or user is not the receiver.',
    }),
    ApiResponse({
      status: 404,
      description: 'Transfer not found.',
    }),
    ApiResponse({
      status: 409,
      description: 'Transfer has already been reversed.',
    }),
  );
}
