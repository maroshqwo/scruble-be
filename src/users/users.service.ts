import { BadRequestException, Injectable } from "@nestjs/common";
import { UserRegisterDto, UserUpdateDto } from "./types";
import { PrismaService } from "src/prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { User } from "@prisma/client";
import * as _ from "lodash";
import { CreateFriendRequestDto } from "src/global-ws/types";
import { UserWithoutPassword } from "src/auth/types";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: number) {
    return this.prisma.user.findFirst({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email },
    });
  }

  async create(userRegisterDto: UserRegisterDto) {
    const { password, ...dto } = userRegisterDto;

    const hash = await this.hashPassword(password);

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: userRegisterDto.email },
          { handle: userRegisterDto.handle },
        ],
      },
    });

    if (user) {
      if (user.email === userRegisterDto.email)
        throw new BadRequestException("Email already taken");
      else throw new BadRequestException("Handle already taken");
    }

    return this.prisma.user.create({
      data: { ...dto, password: hash },
    });
  }

  async update(dto: UserUpdateDto, user: User) {
    if (!user) throw new BadRequestException("User not found");
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        ...dto,
      },
    });
    return _.omit(updatedUser, "password");
  }

  private hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }
}
