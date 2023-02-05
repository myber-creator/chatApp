import { BlockMessagesEntity } from './block-messages/block-messages.entity';
import { UserEntity } from 'src/user/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { MessageEntity } from './message/message.entity';
import { RoomEntity } from './room/room.entity';
import { RoomService } from './room/room.service';
import { MessageService } from './message/message.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getJwtConfig } from 'src/config/jwt.config';
import { JwtStrategy } from 'src/strategies/jwt.strategy';
import { NotifyEntity } from './notify/notify.entity';
import { BlockMessagesService } from './block-messages/block-messages.service';
import { UnreadingMessagesService } from './unreading-messages/unreading-messages.service';
import { UnreadingMessagesEntity } from './unreading-messages/unreading-messages.entity';
import { NotifyService } from './notify/notify.service';

@Module({
  providers: [
    ChatGateway,
    ChatService,
    RoomService,
    MessageService,
    JwtStrategy,
    BlockMessagesService,
    UnreadingMessagesService,
    NotifyService,
  ],
  imports: [
    UserModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
    TypeOrmModule.forFeature([
      RoomEntity,
      MessageEntity,
      UserEntity,
      BlockMessagesEntity,
      NotifyEntity,
      UnreadingMessagesEntity,
    ]),
  ],
})
export class ChatModule {}
