import { FileEntity } from './../../file/file.entity';
import { UnreadingMessagesEntity } from './../unreading-messages/unreading-messages.entity';
import { BlockMessagesEntity } from './../block-messages/block-messages.entity';
import { NotifyEntity } from './../notify/notify.entity';
import { UserEntity } from 'src/user/user.entity';
import {
  Entity,
  ManyToOne,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Base } from '../../utils/base';

@Entity('Message')
export class MessageEntity extends Base {
  @Column({ default: '' })
  body?: string;

  @Column({ default: false })
  isEdit: boolean;

  @Column({ nullable: true })
  editedAt?: Date;

  @Column({ default: false })
  isResended: boolean;

  @ManyToMany(() => UserEntity, (user) => user.isReadMessages)
  @JoinTable()
  isNotRead: UserEntity[];

  @ManyToOne(() => UserEntity, (user) => user.messages)
  @JoinColumn()
  author: UserEntity;

  @ManyToOne(() => BlockMessagesEntity, (block) => block.messages)
  @JoinColumn()
  block: BlockMessagesEntity;

  @OneToMany(() => NotifyEntity, (notify) => notify.afterMessage)
  @JoinColumn()
  notifies?: NotifyEntity[];

  @OneToOne(() => UnreadingMessagesEntity, (message) => message.message)
  unreadingMessage: UnreadingMessagesEntity;

  @ManyToOne(() => UserEntity, (user) => user.resendingMessage)
  @JoinColumn()
  byUser?: UserEntity;

  @OneToMany(() => FileEntity, (file) => file.message)
  @JoinColumn()
  files?: FileEntity[];
}
