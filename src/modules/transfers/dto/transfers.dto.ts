import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class TransferDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({ example: 10050, description: 'Amount to transfer in cents' })
  amount: number;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    example: '6ae1f0f1-5ee4-83ea-993d-ad82fb352537',
    description: 'ID of the user receiving the transfer.',
  })
  receiverId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    example: '6ae1f0f1-5ee4-83ea-993d-ad82fb352537',
    description:
      'Unique key used to prevent duplicate transfers when a request is retried.',
  })
  idempotencyKey: string;
}
