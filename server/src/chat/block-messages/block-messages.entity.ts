import { NotifyEntity } from './../notify/notify.entity';
import { RoomEntity } from '../room/room.entity';
import { Entity, ManyToOne, Column, OneToMany, JoinColumn } from 'typeorm';
import { Base } from '../../utils/base';
import { MessageEntity } from '../message/message.entity';

@Entity('BlockMessages')
export class BlockMessagesEntity extends Base {
  @Column()
  date: Date;

  @OneToMany(() => MessageEntity, (message) => message.block)
  messages: MessageEntity[];

  @ManyToOne(() => RoomEntity, (room) => room.blocks)
  @JoinColumn()
  room: RoomEntity;

  @OneToMany(() => NotifyEntity, (notify) => notify.block)
  notifies: NotifyEntity[];
}
