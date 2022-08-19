import {
  Controller,
  Param,
  Put,
  UseGuards,
  Request,
  Body,
  Post,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RequestWithUser } from "src/auth/types";
import { FriendRequestDto, UserUpdateDto } from "./types";
import { UsersService } from "./users.service";

@UseGuards(JwtAuthGuard)
@Controller("user")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put("")
  async updated(@Request() req: RequestWithUser, @Body() data: UserUpdateDto) {
    return this.usersService.update(data, req.user);
  }
}
