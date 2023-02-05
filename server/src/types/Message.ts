import { BlockMessagesEntity } from './../chat/block-messages/block-messages.entity';
import { IRoom } from './Room';
import { IUser } from './User';

export interface IMessage {
  id: number;
  body: string;
  author: IUser;
  block: BlockMessagesEntity;
  createdAt: Date;
  updatedAt: Date;
  isEdit?: boolean;
  isRead: boolean;
  editedAt?: Date;
  isResended: boolean;
}
