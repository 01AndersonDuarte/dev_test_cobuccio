import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { User as UserDecorator } from '../../decorators/user.decorator.js';
import type { AuthenticatedUser } from '../../guards/types/authenticated-user.js';
import { AuthGuard } from '../../guards/auth.guard.js';
import { TransfersService } from './transfers.service.js';
import { TransferResponseDto } from './dto/transfers-response.dto.js';
import { TransferDto } from './dto/transfers.dto.js';
import { ReversalService } from './reversals.service.js';

@ApiBearerAuth('bearer')
@Controller('transfers')
@UseGuards(AuthGuard)
export class TransfersController {
  constructor(
    private readonly transfersService: TransfersService,
    private readonly reversalService: ReversalService,
  ) {}

  @Post('')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: TransferResponseDto,
    excludeExtraneousValues: true,
  })
  @ApiOperation({ summary: 'Make a new transfer' })
  @ApiResponse({
    status: 201,
    description: 'Transfer completed  successfully.',
  })
  @ApiResponse({
    status: 409,
    description: 'The idempotency key has already been used',
  })
  async createTransfer(
    @UserDecorator() user: AuthenticatedUser,
    @Body() transferData: TransferDto,
  ) {
    return await this.transfersService.createTransfer(user, transferData);
  }

  @Post('/:id/reversal')
  async reverseTransfer(
    @Param('id', new ParseUUIDPipe()) transferId: string,
    @UserDecorator() user: AuthenticatedUser,
  ) {
    return await this.reversalService.reverseTransfer(user, transferId);
  }
}
