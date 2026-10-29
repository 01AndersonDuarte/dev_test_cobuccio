import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class WalletDepositDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({ example: 10050, description: 'Amount to deposit in cents' })
  amount: number;
}
