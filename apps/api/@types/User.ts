import { Role } from "./index.ts";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
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
  updatedAt?: Date;
}
