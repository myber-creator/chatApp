import { BlockMessagesEntity } from './../block-messages/block-messages.entity';
import { UserEntity } from './../../user/user.entity';
import { Entity, ManyToOne, Column, OneToOne, JoinColumn } from 'typeorm';
import { Base } from '../../utils/base';
import { MessageEntity } from '../message/message.entity';

@Entity('Notify')
export class NotifyEntity extends Base {
  @Column()
  body: Date;

  @ManyToOne(() => UserEntity, (user) => user.notifies)
  @JoinColumn()
  author: UserEntity;

  @OneToOne(() => MessageEntity, (message) => message.notify)
  @JoinColumn()
  afterMessage?: MessageEntity;

  @ManyToOne(() => BlockMessagesEntity, (block) => block.notifies)
  @JoinColumn()
  block: BlockMessagesEntity;
}
