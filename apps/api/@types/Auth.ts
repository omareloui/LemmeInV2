import { User } from "./index.ts";
import { roles, rights } from "../config/index.ts";

export type Role = typeof roles[number];
export type Roles = typeof roles;
export type Rights = typeof rights;
export type Right = typeof rights[number];

export interface RegisterOptions {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: Role;
}

export interface UpdateMeOptions {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  oldPassword?: string;
}

export interface LoginOptions {
  email: string;
  password: string;
}

export interface LoggingStructure {
  user: User;
  token: {
    expires: Date;
    token: string;
  };
}
