import { UnreadingMessagesEntity } from './../unreading-messages/unreading-messages.entity';
import { UserEntity } from 'src/user/user.entity';
import { Entity, ManyToMany, OneToMany, Column } from 'typeorm';
import { Base } from '../../utils/base';
import { BlockMessagesEntity } from '../block-messages/block-messages.entity';

@Entity('Room')
export class RoomEntity extends Base {
  @Column()
  name: string;

  @ManyToMany(() => UserEntity, (user) => user.rooms)
  users: UserEntity[];

  @OneToMany(() => BlockMessagesEntity, (block) => block.room)
  blocks: BlockMessagesEntity[];

  @OneToMany(() => UnreadingMessagesEntity, (message) => message.room)
  unreadingMessages: UnreadingMessagesEntity[];
}
