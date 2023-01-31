import { Auth } from './../decorators/auth.decorator';
import { RefreshTokenDto } from './refresh-token.dto';
import {
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserLoginDto, UserRegisterDto } from './user-auth.dto';
import { UserService } from './user.service';
import { Query } from '@nestjs/common/decorators';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: UserLoginDto) {
    return this.userService.login(dto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('login/access-token')
  async getNewTokens(@Body() dto: RefreshTokenDto) {
    return this.userService.getNewTokens(dto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('register')
  async register(@Body() dto: UserRegisterDto) {
    return this.userService.create(dto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('exit')
  @Auth()
  async exit(@Query('id') id: number) {
    return this.userService.exit(id);
  }
}
