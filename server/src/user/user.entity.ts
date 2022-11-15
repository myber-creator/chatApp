import { Entity, Column, ManyToMany, OneToMany, JoinColumn } from 'typeorm';
import { RoomEntity } from '../room/room.entity';
import { MessageEntity } from '../message/message.entity';
import { Base } from '../utils/base';

@Entity('User')
export class UserEntity extends Base {
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ unique: true })
  username: string;

  @Column({ default: '', name: 'avatar_path' })
  avatarPath: string;

  @Column({ default: false, name: 'is_online' })
  isOnline: boolean;

  @Column({ default: '', name: 'socket_id', select: false })
  socketId: string;

  @ManyToMany(() => RoomEntity, (room) => room.users)
  @JoinColumn({ name: 'room_id' })
  rooms: RoomEntity[];

  @OneToMany(() => MessageEntity, (message) => message.author)
  @JoinColumn({ name: 'message_id' })
  messages: MessageEntity[];
}
