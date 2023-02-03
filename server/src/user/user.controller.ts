import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
  Req,
  Res,
  Get,
} from '@nestjs/common';
import { UserLoginDto, UserRegisterDto } from './dto/user-auth.dto';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { Auth } from 'src/decorators/auth.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() dto: UserLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.login(dto, res);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('login/refresh')
  async getNewTokens(@Req() req: Request) {
    const dto: RefreshTokenDto = { refreshToken: req.cookies['token'] };

    return this.userService.getNewTokens(dto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('register')
  async register(
    @Body() dto: UserRegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.create(dto, res);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth()
  @Get('anotherUsers')
  async getAnotherUsers(@Body() { id }) {
    return this.userService.getAnotherUsers(id);
  }
}