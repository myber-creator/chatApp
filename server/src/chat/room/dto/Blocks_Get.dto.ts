import { IsNumber } from 'class-validator';

export class BlockGetDto {
  @IsNumber()
  id: number;

  @IsNumber()
  skip: number;

  @IsNumber()
  take: number;
}
