import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class WalletResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  balance!: number;

  @ApiProperty()
  @Expose()
  createdAt!: Date;
}
