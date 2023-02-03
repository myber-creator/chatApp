import { IUser } from 'src/types/User';
export interface IRoom {
  id: number;
  name: string;
  users: IUser[];
}
