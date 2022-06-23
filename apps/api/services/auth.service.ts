import {
  LoginOptions,
  RegisterOptions,
  UpdateMeOptions,
  LoggingStructure,
  User as UserType,
} from "../@types/index.ts";

import {
  HashHelper,
  ErrorHelper,
  CollectionHelper,
  JwtHelper,
} from "../helpers/index.ts";

import { User } from "../models/index.ts";
import { BaseService, UserService } from "./index.ts";

const UserHelper = new CollectionHelper(User);
const authErrorHelper = new ErrorHelper("auth");

export class AuthService extends BaseService {
  public static async login({
    email: enteredEmail,
    password,
  }: LoginOptions): Promise<LoggingStructure> {
    // Get the user and validate him
    const user = await UserHelper.findOne({ email: enteredEmail });
    const isValidPass =
      user && (await HashHelper.compare(password, user.password));
    if (!user?.password || !isValidPass)
      return authErrorHelper.unauthorized({
        message: `email or password is not correct`,
        path: "login",
      });
    // Get the token
    const id = user.id.toString();
    const token = await JwtHelper.createAccessToken(id);
    const { firstName, lastName, email, role, createdAt, updatedAt } = user;
    return {
      token,
      user: { id, firstName, lastName, email, role, createdAt, updatedAt },
    };
  }

  public static async register(
    options: RegisterOptions,
  ): Promise<LoggingStructure> {
    // Create the user
    const user = await UserService.create(options);
    if (!user) return authErrorHelper.notFound();
    const { id, firstName, lastName, email, role, createdAt, updatedAt } = user;
    const token = await JwtHelper.createAccessToken(id.toString());
    return {
      token,
      user: { id, firstName, lastName, email, role, createdAt, updatedAt },
    };
  }

  public static async me(userId: string): Promise<UserType> {
    const user = await UserService.getOne(userId);
    if (!user) return authErrorHelper.notFound();
    return user;
  }

  public static async updateMe(
    options: UpdateMeOptions,
    userId: string,
  ): Promise<LoggingStructure> {
    // Create the user
    const user = await UserService.updateMe(options, userId);
    if (!user) return authErrorHelper.notFound();
    const { id, firstName, lastName, email, role, createdAt, updatedAt } = user;
    const token = await JwtHelper.createAccessToken(user.id.toString());
    return {
      token,
      user: { id, firstName, lastName, email, role, createdAt, updatedAt },
    };
  }
}
