import { UserEntity } from 'src/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomEntity } from './room.entity';
import { Injectable } from '@nestjs/common';
import { RoomDto } from './dto/room.dto';
import { UserService } from 'src/user/user.service';
import { IUser } from 'src/types/User';
import { IRoom } from 'src/types/Room';
import { UnreadingMessagesService } from '../unreading-messages/unreading-messages.service';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private userService: UserService,
    private unreadingMessageService: UnreadingMessagesService,
  ) {}

  async getRoomsForUser(user: UserEntity) {
    const id = user.id;

    const roomsFromDB = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.users', 'users')
      .where('users.id = :id', { id })
      .leftJoinAndSelect('room.users', 'all_users')
      .leftJoin('room.unreadingMessages', 'messages')
      .orderBy('room.update_at', 'DESC')
      .getMany();

    const rooms = await Promise.all(
      roomsFromDB.map(async (room) => {
        const count = await this.unreadingMessageService.getCountForUserByRoom(
          user,
          room.id,
        );

        return {
          ...room,
          countUnreadingMessage: count,
        };
      }),
    );

    return rooms;
  }

  async getBlocksByRoom(id: number) {
    const { blocks } = await this.roomRepository.findOne({
      where: {
        id,
      },
      select: ['blocks'],
      relations: {
        blocks: {
          messages: {
            author: true,
          },
          notifies: true,
        },
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return blocks;
  }

  async createRoom(dto: RoomDto, creator: IUser) {
    const users = [];

    for (let index = 0; index < dto.users.length; index++) {
      const user = await this.userService.findById(dto.users[index].id);
      users[index] = user;
    }

    const newRoom = await this.roomRepository.create({
      name: dto.name,
      users: [...users, creator],
      blocks: [],
    });

    const room = await this.roomRepository.save(newRoom);

    return room;
  }

  async findById(id: number) {
    return await this.roomRepository.findOne({
      where: { id },
      select: ['users'],
      relations: {
        users: true,
        blocks: true,
      },
    });
  }

  async addUser(room: IRoom, user: IUser) {
    const candidate = await this.userRepository.findOne({
      where: { id: user.id },
    });

    if (!room.users.includes(candidate)) room.users.push(candidate);

    await this.roomRepository.save(room);

    return candidate;
  }

  async getConnectedUsers(users: IUser[]) {
    const connection = users.reduce(async (array, u) => {
      const user = await this.userService.getSocketById(u.id);
      const arr = await array;

      if (user.socketId) {
        arr.push(user);
      }

      return arr;
    }, Promise.resolve([]));

    return connection;
  }

  async leaveFromRoom(room: IRoom, user: IUser) {
    room.users = room.users.filter((u) => u.id != user.id);

    await this.roomRepository.save(room);

    return room.users;
  }
}
