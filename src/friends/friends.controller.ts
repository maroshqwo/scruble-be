import { Controller, UseGuards, Get, Request } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RequestWithUser } from "src/auth/types";
import { PrismaService } from "src/prisma/prisma.service";
import { FriendsService } from "./friends.service";

@Controller("friends")
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get("")
  async getFriends(@Request() req: RequestWithUser) {
    return this.friendsService.getFriends(req.user);
  }

  @Get("requests")
  async getFriendRequests(@Request() req: RequestWithUser) {
    const sentRequests = await this.friendsService.getSentFriendRequests(
      req.user
    );
    const recievedRequests =
      await this.friendsService.getRecievedFriendRequests(req.user);
    return {
      sentRequests,
      recievedRequests,
    };
  }

  @Get("requests/recieved")
  async getRecievedFriendRequests(@Request() req: RequestWithUser) {
    return this.friendsService.getRecievedFriendRequests(req.user);
  }

  @Get("requests/sent")
  async getSentFriendRequests(@Request() req: RequestWithUser) {
    return this.friendsService.getSentFriendRequests(req.user);
  }
}
