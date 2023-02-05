import { BlockMessagesEntity } from './../block-messages/block-messages.entity';
import { MessageEntity } from './message.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUser } from 'src/types/User';
import { UnreadingMessagesService } from '../unreading-messages/unreading-messages.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    private unreadingMessageService: UnreadingMessagesService,
  ) {}

  async createMessage(body: string, user: IUser, block: BlockMessagesEntity) {
    const newMessage = await this.messageRepository.create({
      author: user,
      body,
      block,
    });

    const message = await this.messageRepository.save(newMessage);

    await this.unreadingMessageService.createUnreadMessage(message, block.room);

    return message;
  }

  async findById(id: number) {
    return await this.messageRepository.findOne({
      where: { id },
      relations: {
        block: true,
        author: true,
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

  async readMessage(id: number) {
    const message = await this.messageRepository.save({ id, isRead: true });

    await this.unreadingMessageService.deleteMessage(id);

    return {
      id: message.id,
      isRead: message.isRead,
    };
  }

  async resendMessage(oldMessage: MessageEntity, block: BlockMessagesEntity) {
    const newMessage = await this.messageRepository.create({
      createdAt: oldMessage.createdAt,
      body: oldMessage.body,
      isEdit: oldMessage.isEdit,
      editedAt: oldMessage.editedAt,
      author: oldMessage.author,
      isResended: true,
      block,
    });

    const message = await this.messageRepository.save(newMessage);

    await this.unreadingMessageService.createUnreadMessage(message, block.room);

    return message;
  }

  // TODO: Переписать объект. Развернуть message и перезаписать поля(?)
  getMessageFileds(message: MessageEntity) {
    return {
      id: message.id,
      body: message.body,
      createdAt: message.createdAt,
      block: message.block.id,
      author: message.author.id,
      isEdit: message.isEdit,
      editedAt: message.editedAt,
      isRead: message.isRead,
      isResended: message.isResended,
    };
  }
}
