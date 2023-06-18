import { RoomEntity } from './../room/room.entity';
import { UserEntity } from './../../user/user.entity';
import { MessageEntity } from './../message/message.entity';
import { UnreadingMessagesEntity } from './unreading-messages.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, MoreThan, LessThan } from 'typeorm';

@Injectable()
export class UnreadingMessagesService {
  constructor(
    @InjectRepository(UnreadingMessagesEntity)
    private readonly unreadMessageRepository: Repository<UnreadingMessagesEntity>,
  ) {}

  async createUnreadMessage(message: MessageEntity, room: RoomEntity) {
    const newMessage = await this.unreadMessageRepository.create({
      message,
      room,
    });

    const unreadingMessage = await this.unreadMessageRepository.save(
      newMessage,
    );

    return unreadingMessage;
  }

  async deleteMessage(id: number) {
    return await this.unreadMessageRepository.delete({
      message: {
        id,
      },
    });
  }

  async findMessagesBefore(
    id: number,
    user: UserEntity,
    message: MessageEntity,
  ) {
    return await this.unreadMessageRepository.find({
      where: {
        message: {
          createdAt: LessThan(message.createdAt),
          isNotRead: {
            id: user.id,
          },
        },
        room: {
          id,
        },
      },
      relations: {
        message: true,
      },
      order: {
        message: {
          createdAt: 'ASC',
        },
      },
    });
  }

  async getCountForUserByRoom(user: UserEntity, roomId: number) {
    return await this.unreadMessageRepository.count({
      where: {
        room: { id: roomId },
        message: {
          author: {
            id: Not(user.id),
          },
          isNotRead: {
            id: user.id,
          },
        },
      },
    });
  }
}
