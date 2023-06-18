import { UnreadingMessagesEntity } from './../unreading-messages/unreading-messages.entity';
import { UserEntity } from 'src/user/user.entity';
import { Entity, ManyToMany, OneToMany, Column } from 'typeorm';
import { Base } from '../../utils/base';
import { BlockMessagesEntity } from '../block-messages/block-messages.entity';
import { RoomType } from 'src/types/RoomType';

@Entity('Room')
export class RoomEntity extends Base {
  @Column()
  name: string;

  @Column()
  type: RoomType;

  @Column({ default: '' })
  avatarPath: string;

  @ManyToMany(() => UserEntity, (user) => user.rooms)
  users: UserEntity[];

  @OneToMany(() => BlockMessagesEntity, (block) => block.room)
  blocks: BlockMessagesEntity[];

  @OneToMany(() => UnreadingMessagesEntity, (message) => message.room)
  unreadingMessages: UnreadingMessagesEntity[];

  @Column({ default: false })
  isUpdated: boolean;
}
