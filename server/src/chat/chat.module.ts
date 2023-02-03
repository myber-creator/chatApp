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

@Module({
  providers: [
    ChatGateway,
    ChatService,
    RoomService,
    MessageService,
    JwtStrategy,
  ],
  imports: [
    UserModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
    TypeOrmModule.forFeature([RoomEntity, MessageEntity, UserEntity]),
  ],
})
export class ChatModule {}
