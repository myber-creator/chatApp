import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, ArrayContains, Not, IsNull } from 'typeorm';
import { UserLoginDto, UserRegisterDto } from './user-auth.dto';
import { UserEntity } from './user.entity';
import { compare, genSalt, hash } from 'bcryptjs';
import { RefreshTokenDto } from './refresh-token.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async create(dto: UserRegisterDto) {
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
    });

    const user = await this.userRepository.save(newUser);

    const tokens = await this.issuePairTokens(user.id);

    return {
      user: this.getUserFields(user),
      ...tokens,
    };
  }

  async login(dto: UserLoginDto) {
    const user = await this.validateUser(dto);
    const tokens = await this.issuePairTokens(user.id);

    user.isOnline = true;
    await this.userRepository.save(user);

    return {
      user: this.getUserFields(user),
      ...tokens,
    };
  }

  async exit(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException('Пользователь не найден!');

    user.isOnline = false;
    await this.userRepository.save(user);
  }

  async findAllByUsername(username: string) {
    return await this.userRepository.find({
      where: { username: Like(`%${username.toLowerCase()}%`) },
    });
  }

  async findAllOnlineJoined(id_room: number) {
    return await this.userRepository.find({
      where: {
        rooms: ArrayContains([id_room]),
        socketId: Not(IsNull()),
      },
      select: ['socketId'],
    });
  }

  async getSocketById(id: number) {
    return await this.userRepository.find({
      where: { id },
      select: ['socketId'],
    });
  }

  async findById(id: number) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  async validateUser(dto: UserLoginDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: dto.email,
      },
      select: ['id', 'email', 'password', 'username', 'avatarPath', 'rooms'],
      relations: {
        rooms: true,
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
      expiresIn: '1m',
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
    console.log(result);

    if (!result) throw new UnauthorizedException('Токен не верный!');

    const user = await this.userRepository.findOne({
      where: { id: result.id },
    });

    const tokens = await this.issuePairTokens(user.id);

    return {
      user: this.getUserFields(user),
      ...tokens,
    };
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
