import { RoomEntity } from './../room/room.entity';
import { Base } from 'src/utils/base';
import { Entity, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { MessageEntity } from '../message/message.entity';

@Entity('UnreadingMessages')
export class UnreadingMessagesEntity extends Base {
  @OneToOne(() => MessageEntity, (message) => message.unreadingMessage)
  @JoinColumn()
  message: MessageEntity;

  @ManyToOne(() => RoomEntity, (room) => room.unreadingMessages)
  @JoinColumn()
  room: RoomEntity;
}
