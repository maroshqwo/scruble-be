import { Controller, Request, UseGuards, Post, Get } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { RequestWithBody, RequestWithUser } from "./types";
import * as _ from "lodash";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { UsersService } from "src/users/users.service";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService
  ) {}

  @Post("login")
  async login(@Request() req: RequestWithBody) {
    return {
      ...(await this.authService.login(req.body)),
    };
  }

  @Post("register")
  async register(@Request() req: RequestWithBody) {
    await this.authService.register(req.body);
    return await this.authService.login(req.body);
  }

  @UseGuards(JwtAuthGuard)
  @Get("")
  async getUser(@Request() req: RequestWithUser) {
    const res = await this.userService.findOne(req.user.id);
    return _.omit(res, "password");
  }
}
