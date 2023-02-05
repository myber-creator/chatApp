import { BlockMessagesEntity } from './block-messages.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { MessageEntity } from '../message/message.entity';
import { RoomEntity } from '../room/room.entity';
import { MessageService } from '../message/message.service';

@Injectable()
export class BlockMessagesService {
  constructor(
    @InjectRepository(BlockMessagesEntity)
    private readonly blockMessagesRepository: Repository<BlockMessagesEntity>,
    private messageService: MessageService,
  ) {}

  async createBlock(room: RoomEntity) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    const newBlock = await this.blockMessagesRepository.create({
      date,
      room,
      messages: [],
      notifies: [],
    });

    const block = await this.blockMessagesRepository.save(newBlock);

    return block;
  }

  async deleteBlock(block: BlockMessagesEntity) {
    return await this.blockMessagesRepository.remove(block);
  }

  async findById(id: number) {
    return await this.blockMessagesRepository.findOne({
      where: {
        id,
      },
      relations: { messages: true },
    });
  }

  async createMessage(body: string, user: UserEntity, room: RoomEntity) {
    const { block, isNewBlock } = await this.checkExistBlock(room);

    const message = await this.messageService.createMessage(body, user, block);

    block.messages.push(message);

    return {
      idRoom: room.id,
      block: isNewBlock ? this.getBlockFields(block) : undefined,
      message: this.messageService.getMessageFileds(message),
    };
  }

  async resendMessage(message: MessageEntity, room: RoomEntity) {
    const { block, isNewBlock } = await this.checkExistBlock(room);

    const resendingMessage = await this.messageService.resendMessage(
      message,
      block,
    );

    block.messages.push(resendingMessage);

    return {
      idRoom: room.id,
      message: this.messageService.getMessageFileds(resendingMessage),
      block: isNewBlock ? this.getBlockFields(block) : undefined,
    };
  }

  async checkExistBlock(room: RoomEntity) {
    let isNewBlock = false;

    let block = await this.blockMessagesRepository.findOne({
      where: {
        room: {
          id: room.id,
        },
      },
      order: {
        id: 'DESC',
      },
      relations: {
        messages: true,
        room: true,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!block || this.getDiffDate(block.date, today) >= 1) {
      block = await this.createBlock(room);
      isNewBlock = true;
    }

    return {
      block,
      isNewBlock,
    };
  }

  async checkIsEmptyBlock(id: number) {
    const block = await this.findById(id);
    let idBlock: number;
    // TODO: Проверка и на пустоту оповещения (notifies)
    if (!block.messages.length) {
      idBlock = block.id;
      await this.deleteBlock(block);
    }

    return idBlock;
  }

  getBlockFields(block: BlockMessagesEntity) {
    return {
      id: block.id,
      date: block.date,
      messages: block.messages.slice(0, -1),
    };
  }

  getDiffDate(start: Date, end: Date) {
    const startMilliseconds = start.getTime();
    const endMilliseconds = end.getTime();

    const diff = Math.abs(endMilliseconds - startMilliseconds);

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
