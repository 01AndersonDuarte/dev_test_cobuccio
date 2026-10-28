import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsString,
  IsStrongPassword,
  Length,
  MinLength,
} from 'class-validator';

export class SignBaseDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @IsStrongPassword()
  @MinLength(8)
  @IsNotEmpty()
  @ApiProperty({ example: 'StrongP@ssw0rd!' })
  password: string;
}

export class SignupDto extends SignBaseDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(11, 11)
  @ApiProperty({ example: '12345678901' })
  cpf: string;
}

export class SigninDto extends SignBaseDto {}
