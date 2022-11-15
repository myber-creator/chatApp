import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLoginDto, UserRegisterDto } from './user.dto';
import { UserEntity } from './user.entity';
import { compare, genSalt, hash } from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async create(dto: UserRegisterDto) {
    const oldUser = await this.userRepository.findOneBy({ email: dto.email });

    if (oldUser)
      throw new BadRequestException('Данный пользователь уже зарегестрирован!');

    const salt = await genSalt(10);
    const newUser = await this.userRepository.create({
      email: dto.email,
      password: await hash(dto.password, salt),
      username: dto.username,
    });

    const user = await this.userRepository.save(newUser);

    return {
      user: this.getUserFields(user),
      accessToken: await this.issueAccessToken(user.id),
    };
  }

  async login(dto: UserLoginDto) {
    const user = await this.validateUser(dto);

    return {
      user: this.getUserFields(user),
      accessToken: await this.issueAccessToken(user.id),
    };
  }

  async validateUser(dto: UserLoginDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: dto.email,
      },
      select: ['id', 'email', 'password'],
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    const isValidPassword = await compare(dto.password, user.password);

    if (!isValidPassword)
      throw new UnauthorizedException('Не правильный пароль');

    return user;
  }

  async issueAccessToken(userId: number) {
    const data = { id: userId };

    return await this.jwtService.signAsync(data, {
      expiresIn: '31d',
    });
  }

  getUserFields(user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }
}
