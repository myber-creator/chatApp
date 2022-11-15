import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { MessageEntity } from './message/message.entity';
import { RoomEntity } from './room/room.entity';
import { RoomService } from './room/room.service';
import { MessageService } from './message/message.service';

@Module({
  providers: [ChatGateway, ChatService, RoomService, MessageService],
  imports: [UserModule, TypeOrmModule.forFeature([RoomEntity, MessageEntity])],
})
export class ChatModule {}
