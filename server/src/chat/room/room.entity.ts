import { UserEntity } from 'src/user/user.entity';
import { MessageEntity } from '../message/message.entity';
import { Entity, ManyToMany, OneToMany, Column, JoinTable } from 'typeorm';
import { Base } from '../../utils/base';

@Entity('Room')
export class RoomEntity extends Base {
  @Column()
  name: string;

  @ManyToMany(() => UserEntity, (user) => user.rooms)
  users: UserEntity[];

  @OneToMany(() => MessageEntity, (message) => message.room)
  @JoinTable()
  messages: MessageEntity[];
}
