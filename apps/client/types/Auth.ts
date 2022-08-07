import type { Role } from "./User";

export interface SignInOptions {
  email: string;
  password: string;
}

export interface RegisterOptions {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UpdateMeOptions {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  oldPassword?: string;
}

export interface Token {
  body: string;
  expiration: Date | string;
}

export interface AccessTokenContent {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isValidEmail: boolean;
  role: Role;
}

export interface RefreshTokenContent {
  _id: string;
}

export interface AuthenticationPayload {
  user: AccessTokenContent;
  accessToken: Token;
  refreshToken: Token;
}
