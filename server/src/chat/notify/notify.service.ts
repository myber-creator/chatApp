import { NotifyEntity } from './notify.entity';
import { UserEntity } from './../../user/user.entity';
import { MessageEntity } from '../message/message.entity';
import { BlockMessagesEntity } from './../block-messages/block-messages.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NotifyService {
  constructor(
    @InjectRepository(NotifyEntity)
    private readonly notifyRepository: Repository<NotifyEntity>,
  ) {}

  // TODO: Написать DTO/Интерфейс
  async createNotify(
    body: string,
    user: UserEntity,
    message: MessageEntity | null,
    block: BlockMessagesEntity,
  ) {
    const newNotify = await this.notifyRepository.create({
      body,
      author: user,
      afterMessage: message,
      block,
    });

    const notify = await this.notifyRepository.save(newNotify);

    return notify;
  }
}
