import { IRoom } from './Room';
import { IUser } from './User';

export interface IMessage {
  id: number;
  body: string;
  author: IUser;
  room: IRoom;
  createdAt: Date;
  updatedAt: Date;
}
