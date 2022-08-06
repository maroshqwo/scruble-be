import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import { User } from "@prisma/client";
import { Socket } from "socket.io";
import { AuthService } from "src/auth/auth.service";
import { UsersService } from "src/users/users.service";
import { GlobalService } from "./global.service";
import { SocketWithUser } from "./types";

@WebSocketGateway({ namespace: "global", cors: true })
export class GlobalGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly GlobalService: GlobalService,
    private readonly authService: AuthService,
    private readonly userService: UsersService
  ) {}

  @SubscribeMessage("hello")
  handleHello(@MessageBody() data: string): void {
    console.log(data);
  }

  handleDisconnect(socket: Socket) {
    this.GlobalService.disconnect(socket);
  }

  async handleConnection(socket: Socket) {
    const user = await this._authenticate(socket);
    if (!user) {
      socket.disconnect(true);
      return;
    }
    this.GlobalService.connect(socket, user);
  }

  private async _authenticate(socket: Socket): Promise<User> {
    try {
      const token = socket.handshake.headers.authorization.split(" ")[1];
      const jwtPayload = await this.authService.verify(token);
      const user = await this.userService.findOne(jwtPayload.sub);
      if (!user) {
        socket.disconnect();
        return null;
      }
      return user;
    } catch (error) {
      socket.disconnect();
      return null;
    }
  }
}
