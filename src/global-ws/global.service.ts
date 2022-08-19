import { PrismaService } from "src/prisma/prisma.service";
import { Socket } from "socket.io";
import { SocketWithUser } from "./types";
import { User } from "@prisma/client";
import { IoAdapter } from "@nestjs/platform-socket.io";

export class GlobalService {
  sockets: { [key: string]: SocketWithUser } = {};
  userSockets: { [key: string]: string[] } = {};

  constructor(private readonly prisma: PrismaService) {
    this.sockets = {};
    this.userSockets = {};
  }

  async hello(message: string) {
    const userSocket = this.getSocket(2);

    console.log(message);
  }

  // FRIEND REQUESTS

  async getUserSocket(userId: number): Promise<SocketWithUser | undefined> {
    return this.getSocket(userId);
  }

  async sendToUser(userId: number, event: string, data: any) {
    const userSocket = this.getSocket(userId);
    if (!userSocket) return;
    userSocket.emit(event, data);
  }

  getSocket(userId: number): SocketWithUser | undefined {
    return this.sockets[userId];
  }

  connect(socket: SocketWithUser) {
    this.sockets[socket.user.id] = socket;
    /*const userSockets = this.userSockets[socket.user.id] || [];
    userSockets.push(socket.id);
    this.userSockets[socket.user.id] = userSockets;
    console.log(this.userSockets);*/
    console.log(`Connected: ${socket.id} - ${socket.user.email}`);
  }

  disconnect(socket: Socket) {
    delete this.sockets[socket.id];
    console.log("Disconnected: ", socket.id);
  }
}
