export interface IUser {
  id: number;

  email?: string;
  username?: string;
  avatarPath?: string;
  isOnline?: boolean;
  socketId?: string;
}
