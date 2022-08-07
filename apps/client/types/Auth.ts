// import type { Document } from "mongoose";

export type RegisterOptions = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type UpdateMeOptions = Partial<RegisterOptions> & {
  oldPassword?: string;
};

// export type SignInOptions = {
//   email: string;
//   password: string;
// };

// export interface User {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
//   role: string;
// }

// export interface Token {
//   body: string;
//   expiration: Date;
// }

// export interface JWTContent {
//   user: User;
// }
