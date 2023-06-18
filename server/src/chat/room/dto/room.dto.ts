import { RoomType } from 'src/types/RoomType';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class RoomDto {
  @IsString()
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  users: number[];

  @IsString()
  @IsNotEmpty()
  type: RoomType;
}
