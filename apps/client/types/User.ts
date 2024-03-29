import type { Types } from "mongoose";
import { roles } from "server/config";

export type Role = typeof roles[number];

export interface DehydratedUser {
  firstName: string;
  lastName: string;
  isValidEmail: boolean;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends DehydratedUser {
  _id: Types.ObjectId;
}

export interface ClientUser extends DehydratedUser {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserOptions {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  role?: Role;
}

export interface UpdateUserOptions {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: Role;
  password?: string;
  oldPassword?: string;
}
