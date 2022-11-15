import { UserEntity } from 'src/user/user.entity';
import { MessageEntity } from '../message/message.entity';
import { Entity, ManyToMany, JoinColumn, OneToMany, Column } from 'typeorm';
import { Base } from '../../utils/base';

@Entity('Room')
export class RoomEntity extends Base {
  @Column()
  name: string;

  @ManyToMany(() => UserEntity, (user) => user.rooms)
  @JoinColumn({ name: 'user_id' })
  users: UserEntity[];

  @OneToMany(() => MessageEntity, (message) => message.room)
  @JoinColumn({ name: 'message_id' })
  messages: MessageEntity[];
}
