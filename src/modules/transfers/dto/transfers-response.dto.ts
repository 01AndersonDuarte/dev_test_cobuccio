import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TransferResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  amount!: number;

  @ApiProperty()
  @Expose()
  senderId!: string;

  @ApiProperty()
  @Expose()
  receiverId!: string;
}
