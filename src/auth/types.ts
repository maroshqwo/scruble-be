import type { User } from "@prisma/client";
import type { Request } from "express";

export type JwtPayload = {
  sub: User["id"];
};

export type RequestWithUser = Request & {
  user: User & JwtPayload;
};

export type RequestWithBody = Request & {
  body: any;
};

export type UserLogin = {
  email: string;
  password: string;
};

export type UserRegister = {
  email: string;
  password: string;
  name: string;
  handle: string;
};

export type UserWithoutPassword = Omit<User, "password">;
