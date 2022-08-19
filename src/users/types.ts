export type UserLoginDto = {
  email: string;
  password: string;
};

export type UserRegisterDto = {
  email: string;
  password: string;
  name: string;
  handle: string;
};

export type UserUpdateDto = {
  email?: string;
  name?: string;
  handle?: string;
};

export type FriendRequestDto = {
  email: string;
};
