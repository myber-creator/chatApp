import { UnreadingMessagesEntity } from './../unreading-messages/unreading-messages.entity';
import { BlockMessagesEntity } from './../block-messages/block-messages.entity';
import { NotifyEntity } from './../notify/notify.entity';
import { UserEntity } from 'src/user/user.entity';
import { Entity, ManyToOne, Column, OneToOne, JoinColumn } from 'typeorm';
import { Base } from '../../utils/base';

@Entity('Message')
export class MessageEntity extends Base {
  @Column()
  body: string;

  @Column({ default: false })
  isEdit: boolean;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  editedAt?: Date;

  @Column({ default: false })
  isResended: boolean;

  @ManyToOne(() => UserEntity, (user) => user.messages)
  @JoinColumn()
  author: UserEntity;

  @ManyToOne(() => BlockMessagesEntity, (block) => block.messages)
  @JoinColumn()
  block: BlockMessagesEntity;

  @OneToOne(() => NotifyEntity, (notify) => notify.afterMessage)
  @JoinColumn()
  notify?: NotifyEntity;

  @OneToOne(() => UnreadingMessagesEntity, (message) => message.message)
  unreadingMessage: UnreadingMessagesEntity;
}
