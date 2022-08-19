import { Module } from "@nestjs/common";
import { GlobalService } from "./global.service";
import { GlobalGateway } from "./global.gateway";
import { AuthModule } from "src/auth/auth.module";
import { UsersModule } from "src/users/users.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { FriendsService } from "src/friends/friends.service";

@Module({
  imports: [PrismaModule, AuthModule, UsersModule],
  providers: [GlobalGateway, GlobalService, FriendsService],
})
export class GlobalModule {}
