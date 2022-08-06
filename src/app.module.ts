import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { GlobalModule } from "./global-ws/global.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [AuthModule, UsersModule, GlobalModule],
  controllers: [],
})
export class AppModule {}
