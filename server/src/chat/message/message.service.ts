import { RoomEntity } from './../room/room.entity';
import { UserEntity } from 'src/user/user.entity';
import { BlockMessagesEntity } from './../block-messages/block-messages.entity';
import { MessageEntity } from './message.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUser } from 'src/types/User';
import { UnreadingMessagesService } from '../unreading-messages/unreading-messages.service';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    private unreadingMessageService: UnreadingMessagesService,
  ) {}

  async createMessage(
    body: string,
    user: IUser,
    block: BlockMessagesEntity,
    room: RoomEntity,
  ) {
    const usersExpectMe = room.users.filter((u) => u.id !== user.id);

    const newMessage = await this.messageRepository.create({
      author: user,
      body,
      block,
      isNotRead: [...usersExpectMe],
    });

    const message = await this.messageRepository.save(newMessage);

    await this.unreadingMessageService.createUnreadMessage(message, block.room);

    return message;
  }

  async findById(id: number) {
    return await this.messageRepository.findOne({
      where: { id },
      relations: {
        block: {
          room: {
            users: true,
          },
        },
        author: true,
        isNotRead: true,
      },
    });
  }

  async deleteMessage(message: MessageEntity) {
    await this.unreadingMessageService.deleteMessage(message.id);

    return await this.messageRepository.remove(message);
  }

  async editMessage(id: number, body: string) {
    return await this.messageRepository.save({
      id,
      body,
      isEdit: true,
      editedAt: new Date(),
    });
  }

  async readMessage(id: number, user: UserEntity) {
    const readMessage = await this.findById(id);

    if (!readMessage)
      throw new WsException(new NotFoundException('Сообщение не найдено!'));

    readMessage.isNotRead = readMessage.isNotRead.filter(
      (u) => u.id !== user.id,
    );

    const message = await this.messageRepository.save(readMessage);

    if (message.isNotRead.length === 0)
      await this.unreadingMessageService.deleteMessage(message.id);

    return message;
  }

  async resendMessage(
    oldMessage: MessageEntity,
    block: BlockMessagesEntity,
    user: UserEntity,
    room: RoomEntity,
  ) {
    const usersExpectMe = room.users.filter((u) => u.id !== user.id);

    const newMessage = await this.messageRepository.create({
      createdAt: oldMessage.createdAt,
      body: oldMessage.body,
      isEdit: oldMessage.isEdit,
      editedAt: oldMessage.editedAt,
      byUser: oldMessage.author,
      author: user,
      isResended: true,
      isNotRead: [...usersExpectMe],
      block,
    });

    const message = await this.messageRepository.save(newMessage);

    await this.unreadingMessageService.createUnreadMessage(message, block.room);

    return message;
  }

  async getLastMessage(id: number) {
    const lastMessage = await this.messageRepository.findOne({
      where: {
        block: {
          room: {
            id,
          },
        },
      },
      relations: {
        author: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return lastMessage;
  }

  // TODO: Переписать объект. Развернуть message и перезаписать поля(?)
  getMessageFileds(message: MessageEntity) {
    return {
      id: message.id,
      body: message.body,
      createdAt: message.createdAt,
      block: message.block.id,
      author: message.author,
      isEdit: message.isEdit,
      editedAt: message.editedAt,
      isNotRead: message.isNotRead,
      isResended: message.isResended,
      byUser: message.byUser,
    };
  }
}
