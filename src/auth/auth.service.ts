import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { UserLogin, UserRegister } from "./types";
import { User } from "@prisma/client";
import * as _ from "lodash";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const result = _.omit(user, ["password"]);
      return result;
    } else {
      throw new UnauthorizedException("Invalid credentials");
    }
  }

  async login(userLogin: UserLogin) {
    const user: User = await this.validateUser(
      userLogin.email,
      userLogin.password
    );
    const payload = { email: user.email, id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(user: UserRegister) {
    return this.usersService.create(user);
  }

  async verify(token: string) {
    return this.jwtService.verify(token);
  }
}
