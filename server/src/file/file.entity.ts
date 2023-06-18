import { MessageEntity } from './../chat/message/message.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from 'src/utils/base';

@Entity('FileEntity')
export class FileEntity extends Base {
  @Column()
  type: string;

  @Column({ nullable: true })
  icon?: string;

  @Column()
  size: number;

  @Column()
  name: string;

  @ManyToOne(() => MessageEntity, (message) => message.files)
  message?: MessageEntity;
}
