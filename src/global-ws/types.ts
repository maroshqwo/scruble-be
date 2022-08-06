import { User } from "@prisma/client";
import { Socket } from "socket.io";

export type SocketWithUser = Socket & {
  user: Omit<User, "password">;
};
