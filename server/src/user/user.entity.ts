import {
  Entity,
  Column,
  ManyToMany,
  OneToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { RoomEntity } from '../chat/room/room.entity';
import { MessageEntity } from '../chat/message/message.entity';
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
  avatarPath?: string;

  @Column({ default: false, name: 'is_online' })
  isOnline: boolean;

  @Column({ default: null, name: 'socket_id', select: false })
  socketId?: number;

  @ManyToMany(() => RoomEntity, (room) => room.users)
  @JoinTable()
  rooms: RoomEntity[];

  @OneToMany(() => MessageEntity, (message) => message.author)
  @JoinTable()
  messages: MessageEntity[];
}
