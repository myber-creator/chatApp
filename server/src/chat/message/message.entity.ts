import { UserEntity } from 'src/user/user.entity';
import { RoomEntity } from '../room/room.entity';
import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Base } from '../../utils/base';

@Entity('Message')
export class MessageEntity extends Base {
  @Column()
  body: string;

  @ManyToOne(() => UserEntity, (user) => user.messages)
  @JoinColumn({ name: 'user_id' })
  author: UserEntity;

  @ManyToOne(() => RoomEntity, (room) => room.messages)
  @JoinColumn({ name: 'room_id' })
  room: RoomEntity;
}
