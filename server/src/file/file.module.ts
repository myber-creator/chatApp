import { FileEntity } from './file.entity';
import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [FileService],
  controllers: [FileController],
  imports: [TypeOrmModule.forFeature([FileEntity])],
})
export class FileModule {}
