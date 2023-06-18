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
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User')
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
  @Get('login/refresh')
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
  @Post('anotherUsers')
  async getAnotherUsers(@Body() { id, ownerId }) {
    return this.userService.getAnotherUsers(ownerId, id);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('getUser')
  async getUser(@Body() { token }) {
    return this.userService.getUser(token);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth()
  @Post('editUser')
  async editUser(@Body() { id, username, avatarPath }) {
    return this.userService.editUser(id, username, avatarPath);
  }
}
