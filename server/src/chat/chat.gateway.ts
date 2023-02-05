import { UserEntity } from './../user/user.entity';
import { IUser } from './../types/User';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './../user/user.service';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { MessageService } from './message/message.service';
import { RoomService } from './room/room.service';
import { Server, Socket } from 'socket.io';
import {
  UnauthorizedException,
  BadGatewayException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
// import { RoomDto } from './room/dto/room.dto';
import { BlockMessagesService } from './block-messages/block-messages.service';
import { WsGuard } from 'src/decorators/auth-socket.decorator';

@WebSocketGateway({
  cors: {
    origin: [
      'https://hoppscotch.io',
      'http://localhost:3000',
      'http://localhost:4200',
    ],
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private userService: UserService,
    private roomService: RoomService,
    private messageService: MessageService,
    private blockMessagesService: BlockMessagesService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      // const token = await this.jwtService.verifyAsync(
      //   socket.handshake.headers.authorization,
      // );
      const token = await this.jwtService.verifyAsync(
        socket.handshake.auth.token,
      );

      const user = await this.userService.findById(token.id);

      if (!user) return this.disconnect(socket);

      socket.data.user = user;

      this.userService.setOnline(user, true);

      user.socketId = socket.id;

      const rooms = await this.roomService.getRoomsForUser(user);

      return this.server.to(socket.id).emit('rooms', rooms);
    } catch {
      return this.disconnect(socket);
    }
  }

  async handleDisconnect(socket: Socket) {
    if (socket.data.user) {
      socket.data.user.socketId = null;
      await this.userService.setOnline(socket.data.user, false);
    }

    socket.disconnect();
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('createRoom')
  async createRoom(socket: Socket, dto: string) {
    const createdRoom = await this.roomService.createRoom(
      JSON.parse(dto),
      socket.data.user,
    );

    const connections: UserEntity[] = await this.roomService.getConnectedUsers(
      createdRoom.users,
    );

    for (const user of connections) {
      const rooms = await this.roomService.getRoomsForUser(user);

      await this.server.to(user.socketId).emit('rooms', rooms);
    }
  }

  // TODO: Новым пользователям отправлять руму. Старым - новых юзеров. Добавить сообщение о добавление как notifyEntity
  @UseGuards(WsGuard)
  @SubscribeMessage('addUsersToRoom')
  async addUserToRoom(socket: Socket, dto: string) {
    const idRoom = JSON.parse(dto).id;
    const users = JSON.parse(dto).users;

    if (!users.length)
      throw new WsException(
        new BadGatewayException('Список пользователей пуст!'),
      );

    const room = await this.roomService.findById(idRoom);
    if (!room)
      throw new WsException(new NotFoundException('Комната не найдена!'));

    const newUsers = [];
    for (let index = 0; index < users.length; index++) {
      const user = await this.roomService.addUser(room, users[index]);
      newUsers[index] = user;
    }

    if (!newUsers.length) return;

    const connections: IUser[] = await this.roomService.getConnectedUsers(
      room.users,
    );
    for (const user of connections) {
      const message = {
        initiator: socket.data.user,
        newUsers: [...newUsers],
      };

      await this.server.to(user.socketId).emit('joinedNewUsers', message);
    }
  }

  // TODO: Добавить сообщение о выходе из беседы.
  // Если список пользователей равен 0, удалять руму
  // Сделать проверку на пустоту комнаты
  @UseGuards(WsGuard)
  @SubscribeMessage('leaveFromRoom')
  async leaveFromRoom(socket: Socket, dto: string) {
    const idRoom = JSON.parse(dto).id;

    const room = await this.roomService.findById(idRoom);
    if (!room)
      throw new WsException(new NotFoundException('Комната не найдена!'));

    if (!room.users.find((u) => u.id === socket.data.user.id))
      throw new WsException(
        new BadGatewayException('Пользователь не был подключён к беседе!'),
      );

    const users = await this.roomService.leaveFromRoom(room, socket.data.user);

    const connections = await this.roomService.getConnectedUsers(room.users);
    for (const user of connections) {
      const message = {
        initiator: socket.data.user,
        users,
      };

      await this.server.to(user.socketId).emit('leaveFromRoom', message);
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('getBlocksRoom')
  async getBlocksRoom(socket: Socket, dto: string) {
    const id = JSON.parse(dto).id;

    const room = await this.roomService.findById(id);
    if (!room)
      throw new WsException(new NotFoundException('Комната не найдена!'));

    const blocks = await this.roomService.getBlocksByRoom(id);

    await this.server
      .to(socket.data.user.socketId)
      .emit('getBlocksRoom', blocks);
  }

  // TODO: Подумать над блоками сообщений:
  // (Дата)
  // Сообщения / оповещения (... вышел из чата).
  // Сущность оповещения: id, author, body, candidate? (кого добавил, если null, значит, вышел), \
  // afterMessageId? (Если null, первым в блоке), idBlock (Many to One)
  @UseGuards(WsGuard)
  @SubscribeMessage('sendMessage')
  async sendMessage(socket: Socket, dto: string) {
    const messageDto = JSON.parse(dto);

    const room = await this.roomService.findById(messageDto.roomId);

    if (!room)
      throw new WsException(new NotFoundException('Комната не найдена!'));

    const message = await this.blockMessagesService.createMessage(
      messageDto.body,
      socket.data.user,
      room,
    );

    const connections = await this.roomService.getConnectedUsers(room.users);
    for (const user of connections) {
      await this.server.to(user.socketId).emit('sendMessage', message);
    }
  }

  // TODO: Установка оповещению afterMessage предыдущему удаляемому (если нет, null).
  @UseGuards(WsGuard)
  @SubscribeMessage('deleteMessage')
  async deleteMessage(socket: Socket, dto: string) {
    const id = JSON.parse(dto).id;
    const roomId = JSON.parse(dto).roomId;

    const message = await this.messageService.findById(id);

    if (!message) throw new NotFoundException('Сообщение не найдено!');

    if (message.author.id !== socket.data.user.id)
      throw new WsException(
        new BadGatewayException('Сообщение не принадлежит пользователю!'),
      );

    const room = await this.roomService.findById(roomId);
    if (!room)
      throw new WsException(new NotFoundException('Комната не найдена!'));

    await this.messageService.deleteMessage(message);

    const idBlock = this.blockMessagesService.checkIsEmptyBlock(
      message.block.id,
    );

    const connections = await this.roomService.getConnectedUsers(room.users);
    for (const user of connections) {
      await this.server.to(user.socketId).emit('deleteMessage', {
        ...message,
        id,
        deletedBlock: idBlock,
      });
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('editMessage')
  async editMessage(socket: Socket, dto: string) {
    const id = JSON.parse(dto).id;
    const roomId = JSON.parse(dto).roomId;
    const body = JSON.parse(dto).body;

    const message = await this.messageService.findById(id);

    if (!message)
      throw new WsException(new NotFoundException('Сообщение не найдено!'));

    if (message.author.id !== socket.data.user.id)
      throw new WsException(
        new BadGatewayException('Сообещние не принадлежит пользователю!'),
      );

    const room = await this.roomService.findById(roomId);
    const editedMessage = await this.messageService.editMessage(
      message.id,
      body,
    ); // Добавить DTO/Интерфейс

    const connections = await this.roomService.getConnectedUsers(room.users);
    for (const user of connections) {
      await this.server.to(user.socketId).emit('editMessage', editedMessage);
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('readMessage')
  async readMessage(socket: Socket, dto: string) {
    const id = JSON.parse(dto).id;

    const message = await this.messageService.findById(id);

    if (!message)
      throw new WsException(new NotFoundException('Сообщение не найдено!'));

    if (message.isRead)
      throw new WsException(
        new BadGatewayException('Сообщение уже прочитано!'),
      );

    const readingMessage = await this.messageService.readMessage(message.id);

    await this.server
      .to(socket.data.user.socketId)
      .emit('readMessage', readingMessage);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('resendMessage')
  async resendMessage(socket: Socket, dto: string) {
    const id = JSON.parse(dto).id;
    const roomId = JSON.parse(dto).roomId;

    const message = await this.messageService.findById(id);

    if (!message)
      throw new WsException(new NotFoundException('Сообщение не найдено!'));

    const room = await this.roomService.findById(roomId);
    const resendingMessage = await this.blockMessagesService.resendMessage(
      message,
      room,
    ); // Добавить DTO/Интерфейс

    const connections: UserEntity[] = await this.roomService.getConnectedUsers(
      room.users,
    );
    for (const user of connections) {
      await this.server.to(user.socketId).emit('readMessage', resendingMessage);
    }
  }
}
