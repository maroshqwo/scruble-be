import { Module } from "@nestjs/common";
import { FriendsService } from "./friends.service";
import { FriendsController } from "./friends.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { AuthModule } from "src/auth/auth.module";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [PrismaModule, AuthModule, UsersModule],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
