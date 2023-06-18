import { UserEntity } from './../user/user.entity';
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
import { BlockGetDto } from './room/dto/Blocks_Get.dto';
import { BlockMessagesService } from './block-messages/block-messages.service';
import { WsGuard } from 'src/decorators/auth-socket.decorator';

@WebSocketGateway({
  cors: {
    origin: [
      'https://hoppscotch.io',
      'http://localhost:5173',
      'http://localhost:4200',
      'https://client-eight-zeta.vercel.app',
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

  // TODO:
  // (1) Добавить пагинацию блоков сообщений и комнат [x]
  // (2) Добавить тип для комнаты (Личные сообещния/беседа). Если личные сообщения, отправлять второго юзера (не себя) и name = username [x]
  // (3) Добавить тип для файла в MessageEntity. Файл сделать отдельной Entity []
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

      user.socketId = socket.id;
      await this.userService.setOnline(user, true);

      const rooms = await this.broadcastToUsers('user-connect', socket);

      return this.server.to(socket.id).emit('rooms', rooms);
    } catch {
      return this.disconnect(socket);
    }
  }

  async handleDisconnect(socket: Socket) {
    if (socket.data.user) {
      await this.broadcastToUsers('user-disconnect', socket);

      socket.data.user.socketId = null;
      await this.userService.setOnline(socket.data.user, false);
    }

    socket.disconnect();
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  private async broadcastToUsers(emit: string, socket: Socket) {
    const rooms = await this.roomService.getRoomsForUser(socket.data.user);
    const users = new Map<number, string>();
    for (const room of rooms) {
      const us = await this.roomService.getConnectedUsers(room.users);

      us.forEach((u) => {
        if (!users.has(u.id)) users.set(u.id, u.socketId);
      });
    }

    for (const id of users.keys()) {
      for (const [anotherId, socketId] of users.entries()) {
        if (anotherId === id) continue;

        await this.server.to(socketId).emit(emit, id);
      }
    }

    return rooms;
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('createRoom')
  async createRoom(socket: Socket, dto: string) {
    const dtoRoom = JSON.parse(dto);

    if (dtoRoom.type === 'PRIVATE' && dtoRoom.users.length > 1) {
      throw new WsException(
        new BadGatewayException(
          'Вы не можете добавить в приватную комнату более одного человека!',
        ),
      );
    }

    const createdRoom = await this.roomService.createRoom(
      dtoRoom,
      socket.data.user,
    );

    const connections = await this.roomService.getConnectedUsers(
      createdRoom.users,
    );

    for (const user of connections) {
      let privateRoom;
      if (dtoRoom.type === 'PRIVATE') {
        const interlocutor = createdRoom.users.find((u) => u.id !== user.id);

        privateRoom = {
          ...createdRoom,
          users: [interlocutor],
          name: interlocutor.username,
          avatarPath: interlocutor.avatarPath,
        };
      }
      await this.server
        .to(user.socketId)
        .emit('newRoom', privateRoom ?? createdRoom);
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('addUsersToRoom')
  async addUserToRoom(socket: Socket, dto: string) {
    const { idRoom, users } = JSON.parse(dto);

    if (!users.length)
      throw new WsException(
        new BadGatewayException('Список пользователей пуст!'),
      );

    const room = await this.roomService.findById(idRoom);
    if (!room)
      throw new WsException(new NotFoundException('Комната не найдена!'));

    if (room.type === 'PRIVATE') {
      throw new WsException(
        new BadGatewayException(
          'Невозможно к закрытой комнате добавить пользователя!',
        ),
      );
    }

    if (!room.users.find((u) => u.id === socket.data.user.id)) {
      throw new WsException(
        new BadGatewayException('Пользователь не подключен к комнате!'),
      );
    }

    users.forEach((user) => {
      if (room.users.find((u) => u.id === user.id)) {
        throw new WsException(
          new BadGatewayException(
            `Пользователь ${user.id} уже находится в комнате!`,
          ),
        );
      }
    });

    const rooms = [];
    const newUsers = [];
    for (let index = 0; index < users.length; index++) {
      const user = await this.roomService.addUser(room, users[index]);
      newUsers[index] = user;

      // Прописать интерфейс
      rooms.push({ room, user });
    }

    if (!newUsers.length) {
      throw new WsException(
        new BadGatewayException('Пользователи не были добавлены!'),
      );
    }

    // const bodyNotify = `${socket.data.user.username} добавил ${newUsers
    //   .map((u) => u.username)
    //   .join(', ')}`;
    // const notify = await this.blockMessagesService.createNotify(
    //   room,
    //   bodyNotify,
    //   socket.data.user,
    // );

    // room.updatedAt = notify.createdAt;
    // await this.roomService.updateRoomUpdatedAt(room);

    const connections: UserEntity[] = await this.roomService.getConnectedUsers(
      room.users,
    );
    for (const user of connections) {
      const newUserRooms = rooms.find((r) => r.user.id === user.id);
      if (newUserRooms) {
        await this.server.to(user.socketId).emit('newRoom', newUserRooms.room);
        continue;
      }

      const message = {
        newUsers: [...newUsers],
        // notify,
        room: room.id,
      };

      await this.server.to(user.socketId).emit('joinedNewUsers', message);
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('leaveFromRoom')
  async leaveFromRoom(socket: Socket, dto: string) {
    const idRoom = JSON.parse(dto).id;

    const room = await this.roomService.findById(idRoom);
    if (!room)
      throw new WsException(new NotFoundException('Комната не найдена!'));

    if (!room.users.length) {
      throw new WsException(new BadGatewayException('Комната пуста!'));
    }

    if (!room.users.find((u) => u.id === socket.data.user.id))
      throw new WsException(
        new BadGatewayException('Пользователь не был подключён к беседе!'),
      );

    const users = await this.roomService.leaveFromRoom(room, socket.data.user);

    await this.server
      .to(socket.data.user.socketId)
      .emit('leaveFromRoom', { room: room.id });

    if (room.type === 'PRIVATE') {
      await this.roomService.leaveFromRoom(room, users[0]);

      const user = await this.userService.getSocketById(users[0].id);
      await this.server
        .to(user.socketId)
        .emit('leaveFromRoom', { room: room.id });
    }

    if (!room.users.length) {
      await this.roomService.deleteRoom(room);

      return;
    }

    // const bodyNotify = 'покинул канал';
    // const notify = await this.blockMessagesService.createNotify(
    //   room,
    //   bodyNotify,
    //   socket.data.user,
    // );

    // room.updatedAt = notify.createdAt;
    // await this.roomService.updateRoomUpdatedAt(room);

    const connections = await this.roomService.getConnectedUsers(room.users);
    for (const user of connections) {
      const message = {
        room: room.id,
        initiator: socket.data.user,
        users,
        // notify,
      };

      await this.server.to(user.socketId).emit('leaveFromRoom', message);
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('getBlocksRoom')
  async getBlocksRoom(socket: Socket, dto: BlockGetDto) {
    const room = await this.roomService.findById(dto.id);
    if (!room)
      throw new WsException(new NotFoundException('Комната не найдена!'));

    const blocks = await this.roomService.getBlocksByRoom(
      dto.id,
      socket.data.user,
      dto.skip,
      dto.take,
    );

    await this.server
      .to(socket.data.user.socketId)
      .emit('getBlocksRoom', blocks);
  }

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

    room.updatedAt = message.message.createdAt;
    await this.roomService.updateRoomUpdatedAt(room);

    const connections = await this.roomService.getConnectedUsers(room.users);

    for (const user of connections) {
      await this.server.to(user.socketId).emit('sendMessage', message);
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('deleteMessage')
  async deleteMessage(socket: Socket, dto: string) {
    const id = JSON.parse(dto).id;
    const roomId = JSON.parse(dto).roomId;

    const message = await this.messageService.findById(id);

    if (!message)
      throw new WsException(new NotFoundException('Сообщение не найдено!'));

    if (message.author.id !== socket.data.user.id)
      throw new WsException(
        new BadGatewayException('Сообщение не принадлежит пользователю!'),
      );

    const room = await this.roomService.findById(roomId);
    if (!room)
      throw new WsException(new NotFoundException('Комната не найдена!'));

    if (!room.users.find((u) => u.id === socket.data.user.id))
      throw new WsException(
        new BadGatewayException('Пользователь не был подключён к беседе!'),
      );

    const idBlock = await this.blockMessagesService.deleteMessage(message);

    const lastMessage = await this.messageService.getLastMessage(room.id);

    if (!room.isUpdated) {
      room.updatedAt = lastMessage.createdAt;
      await this.roomService.updateRoomUpdatedAt(room);
    }

    const connections = await this.roomService.getConnectedUsers(room.users);
    for (const user of connections) {
      await this.server.to(user.socketId).emit('deleteMessage', {
        ...message,
        id,
        deletedBlock: idBlock,
        lastMessage,
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
    if (!room)
      throw new WsException(new NotFoundException('Комната не найдена!'));

    if (!room.users.find((u) => u.id === socket.data.user.id))
      throw new WsException(
        new BadGatewayException('Пользователь не был подключён к беседе!'),
      );

    const editedMessage = await this.messageService.editMessage(
      message.id,
      body,
    ); // Добавить DTO/Интерфейс

    const connections = await this.roomService.getConnectedUsers(room.users);
    for (const user of connections) {
      await this.server
        .to(user.socketId)
        .emit('editMessage', { ...editedMessage });
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('readMessage')
  async readMessage(socket: Socket, dto: string) {
    const ids = JSON.parse(dto).ids;

    const messages = [];
    const users = [];
    for (const id of ids) {
      const message = await this.messageService.findById(id);

      if (!message)
        throw new WsException(new NotFoundException('Сообщение не найдено!'));

      if (!users.length) users.push(...message.block.room.users);
      if (!message.isNotRead.find((u) => u.id === socket.data.user.id))
        throw new WsException(
          new BadGatewayException('Сообщение уже прочитано!'),
        );

      const readingMessage = await this.messageService.readMessage(
        message.id,
        socket.data.user,
      );

      messages.push({
        id: readingMessage.id,
        isNotRead: readingMessage.isNotRead,
      });
    }

    const connections = await this.roomService.getConnectedUsers(users);
    for (const user of connections) {
      await this.server.to(user.socketId).emit('readMessage', messages);
    }
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
    if (!room)
      throw new WsException(new NotFoundException('Комната не найдена!'));

    const resendingMessage = await this.blockMessagesService.resendMessage(
      message,
      room,
      socket.data.user,
    ); // Добавить DTO/Интерфейс

    room.updatedAt = resendingMessage.message.createdAt;
    await this.roomService.updateRoomUpdatedAt(room);

    const connections: UserEntity[] = await this.roomService.getConnectedUsers(
      room.users,
    );
    for (const user of connections) {
      await this.server
        .to(user.socketId)
        .emit('resendMessage', resendingMessage);
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('editRoom')
  async editRoom(socket: Socket, dto: string) {
    const { id, name } = JSON.parse(dto);
    let { avatarPath } = JSON.parse(dto);

    const room = await this.roomService.findById(id);
    if (!room)
      throw new WsException(new NotFoundException('Комната не найдена!'));

    try {
      if (!avatarPath) avatarPath = room.avatarPath;

      const editingRoom = await this.roomService.editRoom(id, name, avatarPath);

      const connections: UserEntity[] =
        await this.roomService.getConnectedUsers(room.users);
      for (const user of connections) {
        await this.server.to(user.socketId).emit('editRoom', editingRoom);
      }
    } catch (error) {
      throw new WsException(error);
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('editUser')
  async editUser(socket: Socket, dto: string) {
    const { id, username } = JSON.parse(dto);
    let { avatarPath } = JSON.parse(dto);

    const user = await this.userService.findById(id);
    if (!user)
      throw new WsException(new NotFoundException('Пользователь не найдена!'));

    try {
      if (!avatarPath) avatarPath = user.avatarPath;

      const editingUser = await this.userService.editUser(
        id,
        username,
        avatarPath,
      );

      socket.data.user = editingUser;
      editingUser.socketId = socket.id;

      const connections: UserEntity[] = await this.userService.findAllOnline();
      for (const user of connections) {
        await this.server.to(user.socketId).emit('editUser', editingUser);
      }
    } catch (error) {
      throw new WsException(error);
    }
  }
}
