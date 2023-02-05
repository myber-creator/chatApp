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
      avatarPath: dto.avatarPath,
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

    res.cookie('token', tokens.refreshToken, { httpOnly: true });

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
    if (user) {
      user.isOnline = isOnline;
      await this.userRepository.save(user);
    }
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
      expiresIn: '15d',
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
      throw new UnauthorizedException('Пользователь не авторизован!');

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

  async getAnotherUsers(id: number) {
    const usersInRoom = await this.userRepository.find({
      where: {
        rooms: {
          id,
        },
      },
    });

    const users = await this.userRepository.find({
      where: {
        id: Not(In(usersInRoom.map((u) => u.id))),
      },
    });

    return users;
  }

  getUserFields(user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      avatarPath: user.avatarPath,
      rooms: user.rooms,
    };
  }
}
