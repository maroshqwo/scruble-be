import { PrismaService } from "src/prisma/prisma.service";
import { Socket } from "socket.io";
import { SocketWithUser } from "./types";
import { User } from "@prisma/client";

export class GlobalService {
  sockets: { [key: string]: Socket } = {};
  userSockets: { [key: string]: string[] } = {};

  constructor(private readonly prisma: PrismaService) {
    this.sockets = {};
    this.userSockets = {};
  }

  connect(socket: Socket, user: User) {
    this.sockets[socket.id] = socket;
    const userSockets = this.userSockets[user.id] || [];
    userSockets.push(socket.id);
    this.userSockets[user.id] = userSockets;
    console.log("Connected: ", socket.id);
  }

  disconnect(socket: Socket) {
    delete this.sockets[socket.id];
    console.log("Disconnected: ", socket.id);
  }
}
