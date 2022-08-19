import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { AuthService } from "src/auth/auth.service";
import { UsersService } from "src/users/users.service";
import { GlobalService } from "./global.service";
import { CreateFriendRequestDto, SocketWithUser } from "./types";
import * as _ from "lodash";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { UseGuards } from "@nestjs/common";
import { FriendsService } from "src/friends/friends.service";

@WebSocketGateway({ namespace: "global", cors: true })
export class GlobalGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly GlobalService: GlobalService,
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly friendService: FriendsService
  ) {}

  @WebSocketServer() io: Server;

  @SubscribeMessage("hello")
  async handleHello(
    @MessageBody() data: string,
    @ConnectedSocket() socket: SocketWithUser
  ) {
    console.log(socket.id);
    console.log(data);
    this.io.emit("hello", { Hello: "there" });
    return {
      message: "Friend request sent",
    };
  }

  handleDisconnect(socket: Socket) {
    this.GlobalService.disconnect(socket);
  }

  async handleConnection(socket: SocketWithUser) {
    if (!(await this._authenticate(socket))) return;

    this.GlobalService.connect(socket);
  }

  private async _authenticate(socket: SocketWithUser): Promise<boolean> {
    try {
      const token = socket.handshake.headers.authorization.split(" ")[1];
      const jwtPayload = await this.authService.verify(token);
      const user = await this.userService.findOne(jwtPayload.sub);
      if (!user) {
        socket.disconnect();
        return false;
      }
      socket.user = _.omit(user, "password");
      return true;
    } catch (error) {
      socket.disconnect();
      return false;
    }
  }

  // FRIEND REQUESTS

  @SubscribeMessage("createFriendRequest")
  async handleCreateFriendRequest(
    @MessageBody() dto: CreateFriendRequestDto,
    @ConnectedSocket() socket: SocketWithUser
  ) {
    if (!(await this._authenticate(socket))) return;
    try {
      const request = await this.friendService.createFriendRequest(
        dto,
        socket.user
      );
      request.sender = _.omit(request.sender, "password");
      request.recipient = _.omit(request.recipient, "password");
      socket.emit("createFriendRequest", { request });
      this.GlobalService.sendToUser(
        request.recipient.id,
        "incomingFriendRequest",
        {
          request,
        }
      );
    } catch (error) {
      socket.emit("createFriendRequest", { error });
    }
    return {
      message: "Friend request sent",
    };
  }

  @SubscribeMessage("acceptFriendRequest")
  async handleAcceptFriendRequest(
    @MessageBody() dto: any,
    @ConnectedSocket() socket: SocketWithUser
  ) {
    if (!(await this._authenticate(socket))) return;
    try {
      const res = await this.friendService.acceptFriendRequest(
        dto,
        socket.user
      );
      socket.emit("resolveFriendRequest", {
        user: _.omit(res.friend.user_1, "password"),
        recieved: true,
        action: "ACCEPT",
      });
      this.GlobalService.sendToUser(
        res.friend.user_1.id,
        "resolveFriendRequest",
        {
          user: _.omit(res.friend.user_2, "password"),
          recieved: false,
          action: "ACCEPT",
        }
      );
    } catch (error) {
      socket.emit("resolveFriendRequest", { error });
    }
  }

  @SubscribeMessage("rejectFriendRequest")
  async handleRejectFriendRequest(
    @MessageBody() dto: any,
    @ConnectedSocket() socket: SocketWithUser
  ) {
    if (!(await this._authenticate(socket))) return;
    try {
      const res = await this.friendService.rejectFriendRequest(
        dto,
        socket.user
      );
      socket.emit("resolveFriendRequest", {
        user: _.omit(res.sender, "password"),
        recieved: true,
        action: "REJECT",
      });
      this.GlobalService.sendToUser(res.sender.id, "resolveFriendRequest", {
        user: _.omit(res.recipient, "password"),
        recieved: false,
        action: "REJECT",
      });
    } catch (error) {
      socket.emit("resolveFriendRequest", { error });
    }
  }

  @SubscribeMessage("cancelFriendRequest")
  async handleCancelFriendRequest(
    @MessageBody() dto: any,
    @ConnectedSocket() socket: SocketWithUser
  ) {
    try {
      const res = await this.friendService.cancelFriendRequest(
        dto,
        socket.user
      );
      socket.emit("resolveFriendRequest", {
        user: _.omit(res.recipient, "password"),
        recieved: false,
        action: "CANCEL",
      });
      this.GlobalService.sendToUser(res.recipient.id, "resolveFriendRequest", {
        user: _.omit(res.sender, "password"),
        recieved: true,
        action: "CANCEL",
      });
    } catch (error) {
      socket.emit("resolveFriendRequest", { error });
    }
  }
}
