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
  email: string;

  @IsStrongPassword()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}

export class SignupDto extends SignBaseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(11, 11)
  cpf: string;
}

export class SigninDto extends SignBaseDto {}
