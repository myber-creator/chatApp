import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  CanActivate,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: any): Promise<boolean> {
    const bearerToken = context.args[0].handshake.auth.token;

    try {
      const decoded = await this.jwtService.verifyAsync(bearerToken);
      const user = await this.userService.findById(decoded.id);

      if (!user) {
        throw new WsException(new NotFoundException());
      }

      return true;
    } catch {
      throw new WsException(new UnauthorizedException());
    }
  }
}
