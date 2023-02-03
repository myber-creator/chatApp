import { IUser } from './../../types/User';
import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class RoomDto {
  @IsString()
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  users: IUser[];
}
