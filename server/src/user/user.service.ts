import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, Not, IsNull, In } from 'typeorm';
import { UserLoginDto, UserRegisterDto } from './dto/user-auth.dto';
import { UserEntity } from './user.entity';
import { compare, genSalt, hash } from 'bcryptjs';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Response } from 'express';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async create(dto: UserRegisterDto, res: Response) {
    const oldUser = await this.userRepository.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
    });

    if (oldUser)
      throw new BadRequestException('Данный пользователь уже зарегестрирован!');

    const salt = await genSalt(10);
    const newUser = await this.userRepository.create({
      email: dto.email,
      password: await hash(dto.password, salt),
      username: dto.username,
      avatarPath: dto.avatarPath || '',
      rooms: [],
    });

    const user = await this.userRepository.save(newUser);

    const tokens = await this.issuePairTokens(user.id);

    res.cookie('token', tokens.refreshToken, { httpOnly: true });

    return {
      user: this.getUserFields(user),
      ...tokens,
    };
  }

  async login(dto: UserLoginDto, res: Response) {
    const user = await this.validateUser(dto);
    const tokens = await this.issuePairTokens(user.id);

    res.cookie('token', tokens.refreshToken, { httpOnly: true, secure: false });

    return {
      user: this.getUserFields(user),
      ...tokens,
    };
  }

  async findAllByUsername(username: string) {
    return await this.userRepository.find({
      where: { username: Like(`%${username.toLowerCase()}%`) },
    });
  }

  async findAllOnline() {
    return await this.userRepository.find({
      where: {
        socketId: Not(IsNull()),
      },
      select: ['socketId'],
    });
  }

  async findAllOnlineJoined(id_room: number) {
    return await this.userRepository.find({
      where: {
        rooms: {
          id: id_room,
        },
        socketId: Not(IsNull()),
      },
      select: ['socketId'],
    });
  }

  async getSocketById(id: number) {
    return await this.userRepository.findOne({
      where: { id },
      select: ['id', 'socketId'],
    });
  }

  async findById(id: number) {
    return await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'avatarPath', 'socketId', 'isOnline'],
    });
  }

  async setOnline(user: UserEntity, isOnline: boolean) {
    user.isOnline = isOnline;
    await this.userRepository.save(user);
  }

  async validateUser(dto: UserLoginDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: dto.email,
      },
      select: ['id', 'email', 'password', 'username', 'avatarPath', 'rooms'],
      relations: {
        rooms: {
          blocks: true,
        },
      },
    });

    if (!user) throw new NotFoundException('Пользователь не найден!');

    const isValidPassword = await compare(dto.password, user.password);

    if (!isValidPassword)
      throw new UnauthorizedException('Не корректные данные!');

    return user;
  }

  async issuePairTokens(userId: number) {
    const data = { id: userId };

    const refreshToken = await this.jwtService.signAsync(data, {
      expiresIn: '30d',
    });

    const accessToken = await this.jwtService.signAsync(data, {
      expiresIn: '1h',
    });

    return {
      refreshToken,
      accessToken,
    };
  }

  async getNewTokens({ refreshToken }: RefreshTokenDto) {
    if (!refreshToken)
      throw new BadRequestException('Пользователь не авторизован!');

    const result = await this.jwtService.verifyAsync(refreshToken);

    if (!result) throw new UnauthorizedException('Токен не верный!');

    const user = await this.userRepository.findOne({
      where: { id: result.id },
      relations: {
        rooms: true,
      },
    });

    const tokens = await this.issuePairTokens(user.id);

    return {
      user: this.getUserFields(user),
      ...tokens,
    };
  }

  async getAnotherUsers(ownerId: number, id?: number, skip = 0, take = 10) {
    const ids = [];

    if (id) {
      const usersInRoom = await this.userRepository.find({
        where: {
          rooms: {
            id,
          },
        },
      });

      ids.push(...usersInRoom.map((u) => u.id));
    }

    const owner = await this.userRepository.findOne({
      where: {
        id: ownerId,
      },
    });

    if (owner) {
      ids.push(owner.id);
    }

    const users = await this.userRepository.find({
      where: {
        id: Not(In(ids)),
      },
      order: {
        updatedAt: 'DESC',
      },
    });

    return users;
  }

  async getUser(token: string) {
    try {
      const result = await this.jwtService.verifyAsync(token);

      if (!result) throw new UnauthorizedException('Токен не верный!');

      const user = await this.userRepository.findOne({
        where: { id: result.id },
        select: ['id', 'email', 'username', 'avatarPath'],
      });

      return user;
    } catch (error: any) {
      throw new UnauthorizedException('Токен не верный!');
    }
  }

  async editUser(id: number, username: string, avatarPath: string) {
    return await this.userRepository.save({
      id,
      username,
      avatarPath,
    });
  }

  getUserFields(user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      avatarPath: user.avatarPath,
    };
  }
}
