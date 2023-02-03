import { MessageEntity } from './message.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { RoomEntity } from '../room/room.entity';
import { RoomService } from '../room/room.service';
import { IUser } from 'src/types/User';
import { IRoom } from 'src/types/Room';
import { IMessage } from 'src/types/Message';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    private userService: UserService,
    private roomService: RoomService,
  ) {}

  async createMessage(body: string, user: IUser, room: IRoom) {
    const newMessage = await this.messageRepository.create({
      author: user,
      body,
      room,
    });

    const message = await this.messageRepository.save(newMessage);
    return this.getMessageFileds(message);
  }

  async findById(id: number) {
    return await this.messageRepository.findOne({
      where: { id },
      relations: {
        room: true,
        author: true,
      },
    });
  }

  async deleteMessage(message: MessageEntity) {
    return await this.messageRepository.remove(message);
  }

  async editMessage(id: number, body: string) {
    return await this.messageRepository.save({ id, body, isEdit: true });
  }

  async readMessage(id: number) {
    return await this.messageRepository.save({ id, isRead: true });
  }

  async getMessagesByRoom(roomId: number) {
    return await this.messageRepository.find({
      where: {
        room: {
          id: roomId,
        },
      },
      relations: {
        room: true,
      },
    });
  }

  getMessageFileds(message: IMessage) {
    return {
      id: message.id,
      body: message.body,
      createdAt: message.createdAt,
      room: message.room.id,
      author: message.author.id,
    };
  }
}
