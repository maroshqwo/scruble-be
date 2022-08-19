import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaClient, User } from "@prisma/client";
import { UserWithoutPassword } from "src/auth/types";
import { CreateFriendRequestDto } from "src/global-ws/types";
import { PrismaService } from "src/prisma/prisma.service";
import { UsersService } from "src/users/users.service";
import _ from "lodash";

@Injectable()
export class FriendsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService
  ) {}

  async getFriends(user: User) {
    const friends = await this.prisma.friend.findMany({
      where: {
        OR: [
          {
            userId_1: user.id,
          },
          {
            userId_2: user.id,
          },
        ],
      },
      include: {
        user_1: true,
        user_2: true,
      },
    });

    return friends.map((friend) => {
      if (friend.userId_1 === user.id) {
        return friend.user_2;
      } else {
        return friend.user_1;
      }
    });
  }

  async getRecievedFriendRequests(user: User) {
    return await this.prisma.invite.findMany({
      where: {
        recipientId: user.id,
        status: "PENDING",
        type: "FRIEND",
      },
      include: {
        sender: true,
      },
    });
  }

  async getSentFriendRequests(user: User) {
    return await this.prisma.invite.findMany({
      where: {
        senderId: user.id,
        status: "PENDING",
        type: "FRIEND",
      },
      include: {
        recipient: true,
      },
    });
  }

  // Friends
  async createFriendRequest(
    dto: CreateFriendRequestDto,
    sender: UserWithoutPassword
  ) {
    if (!sender) throw new BadRequestException("Bad request");

    const recipient = await this.usersService.findByEmail(dto.email);
    if (!recipient) throw new BadRequestException("User not found");

    if (recipient.id === sender.id)
      throw new BadRequestException("Cannot send to self");

    const existingRequest = await this.requestExist(sender, recipient);
    if (existingRequest) throw new BadRequestException("Request already exist");

    const areFriends = await this.areFriends(sender, recipient);
    if (areFriends) throw new BadRequestException("Already friends");

    return await this.prisma.invite.create({
      data: {
        recipientId: recipient.id,
        senderId: sender.id,
        type: "FRIEND",
        status: "PENDING",
      },
      include: {
        sender: true,
        recipient: true,
      },
    });
  }

  async acceptFriendRequest(id: number, recipient: UserWithoutPassword) {
    const request = await this.getFriendRequestById(id);
    if (!request) throw new BadRequestException("Request not found");
    if (request.recipientId !== recipient.id)
      throw new BadRequestException("Request not found");
    if (request.status !== "PENDING")
      throw new BadRequestException("Request not found");
    const [updatedRequest, friendRecord] = await this.prisma.$transaction([
      this.prisma.invite.update({
        where: { id },
        data: {
          status: "ACCEPTED",
        },
      }),
      this.prisma.friend.create({
        data: {
          userId_1: request.senderId,
          userId_2: request.recipientId,
        },
        include: {
          user_1: true,
          user_2: true,
        },
      }),
    ]);
    return {
      request: updatedRequest,
      friend: friendRecord,
    };
  }

  async rejectFriendRequest(id: number, recipient: UserWithoutPassword) {
    const request = await this.getFriendRequestById(id);
    if (!request) throw new BadRequestException("Request not found");
    if (request.recipientId !== recipient.id)
      throw new BadRequestException("Request not found");
    if (request.status !== "PENDING")
      throw new BadRequestException("Request not found");
    return await this.prisma.invite.update({
      where: { id },
      data: {
        status: "REJECTED",
      },
      include: {
        sender: true,
        recipient: true,
      },
    });
  }

  async cancelFriendRequest(id: number, sender: UserWithoutPassword) {
    const request = await this.getFriendRequestById(id);
    if (!request) throw new BadRequestException("Request not found");
    if (request.senderId !== sender.id)
      throw new BadRequestException("Request not found");
    if (request.status !== "PENDING")
      throw new BadRequestException("Request not found");
    return await this.prisma.invite.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
      include: {
        sender: true,
        recipient: true,
      },
    });
  }

  private areFriends = async (
    sender: UserWithoutPassword,
    recipient: UserWithoutPassword
  ) => {
    return await this.prisma.friend.findFirst({
      where: {
        OR: [
          {
            userId_1: sender.id,
            userId_2: recipient.id,
          },
          {
            userId_1: recipient.id,
            userId_2: sender.id,
          },
        ],
      },
    });
  };

  private requestExist = async (
    sender: UserWithoutPassword,
    recipient: UserWithoutPassword
  ) => {
    return await this.prisma.invite.findFirst({
      where: {
        senderId: sender.id,
        recipientId: recipient.id,
        type: "FRIEND",
        status: "PENDING",
      },
    });
  };

  async getFriendRequestById(id: number) {
    return await this.prisma.invite.findFirst({
      where: {
        id,
      },
      include: {
        sender: true,
        recipient: true,
      },
    });
  }
}
