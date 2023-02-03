import { UserEntity } from 'src/user/user.entity';
import { RoomEntity } from '../room/room.entity';
import { Entity, ManyToOne, Column } from 'typeorm';
import { Base } from '../../utils/base';

@Entity('Message')
export class MessageEntity extends Base {
  @Column()
  body: string;

  @Column({ default: false })
  isEdit: boolean;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => UserEntity, (user) => user.messages)
  author: UserEntity;

  @ManyToOne(() => RoomEntity, (room) => room.messages)
  room: RoomEntity;
}
