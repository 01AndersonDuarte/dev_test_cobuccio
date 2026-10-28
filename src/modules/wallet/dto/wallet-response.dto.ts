import { Expose } from 'class-transformer';

export class WalletResponseDto {
  @Expose()
  id!: string;

  @Expose()
  balance!: number;

  @Expose()
  createdAt!: Date;
}
