export type RegisterOptions = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type UpdateMeOptions = Partial<RegisterOptions> & {
  oldPassword?: string;
};

export type SignInOptions = {
  email: string;
  password: string;
};

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface Token {
  token: string;
  expires: Date;
}
