import { IsEmail, IsString, MinLength } from 'class-validator';

export class UserLoginDto {
  @IsEmail()
  email: string;

  @MinLength(6, {
    message: 'Не менее 6-ти символов',
  })
  @IsString()
  password: string;
}

export class UserRegisterDto extends UserLoginDto {
  @IsString()
  username: string;
}
