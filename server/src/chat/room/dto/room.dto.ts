import { RoomType } from 'src/types/RoomType';
import { IUser } from '../../../types/User';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class RoomDto {
  @IsString()
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  users: IUser[];

  @IsString()
  @IsNotEmpty()
  type: RoomType;
}
