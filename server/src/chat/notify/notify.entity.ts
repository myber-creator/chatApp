import { BlockMessagesEntity } from './../block-messages/block-messages.entity';
import { UserEntity } from './../../user/user.entity';
import { Entity, ManyToOne, Column, JoinColumn } from 'typeorm';
import { Base } from '../../utils/base';
import { MessageEntity } from '../message/message.entity';

@Entity('Notify')
export class NotifyEntity extends Base {
  @Column()
  body: string;

  @ManyToOne(() => UserEntity, (user) => user.notifies)
  @JoinColumn()
  author: UserEntity;

  @ManyToOne(() => MessageEntity, (message) => message.notifies)
  @JoinColumn()
  afterMessage?: MessageEntity;

  @ManyToOne(() => BlockMessagesEntity, (block) => block.notifies)
  @JoinColumn()
  block: BlockMessagesEntity;
}
