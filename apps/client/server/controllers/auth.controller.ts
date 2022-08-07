import { User } from "server/models";
import {
  compareHash,
  createTokens,
  extractUserPayload,
  refreshTokens,
} from "server/utils";
import { UserController } from "server/controllers";

import type {
  SignInOptions,
  RegisterOptions,
  User as UserInterface,
  UpdateMeOptions,
  AuthenticationPayload,
} from "types";

export class AuthController {
  public static async login({
    email: enteredEmail,
    password,
  }: SignInOptions): Promise<AuthenticationPayload> {
    // Get the user and validate him
    const user = (await User.findOne({ email: enteredEmail })) as
      | UserInterface
      | undefined;
    const isValidPass = user && (await compareHash(password, user.password));
    if (!user?.password || !isValidPass)
      throw createError({
        message: "email or password is not correct",
        statusCode: 400,
      });
    const authenticationPayload = await this.createAuthenticationPayload(user);
    return authenticationPayload;
  }

  public static async register(
    options: RegisterOptions,
  ): Promise<AuthenticationPayload> {
    // Create the user
    const user = await UserController.create(options);
    const authenticationPayload = await this.createAuthenticationPayload(user);
    return authenticationPayload;
  }

  public static async me(userId: string): Promise<UserInterface> {
    const user = await UserController.getOne(userId);
    if (!user)
      throw createError({ message: "Can't find the you!", statusCode: 404 });
    return user;
  }

  public static async updateMe(
    options: UpdateMeOptions,
    userId: string,
  ): Promise<AuthenticationPayload> {
    const user = await UserController.updateMe(options, userId);
    if (!user)
      throw createError({ message: "Can't find the you!", statusCode: 404 });
    const authenticationPayload = await this.createAuthenticationPayload(user);
    return authenticationPayload;
  }

  public static refreshTokens(refreshToken: string) {
    return refreshTokens(refreshToken);
  }

  private static async createAuthenticationPayload(
    user: UserInterface,
  ): Promise<AuthenticationPayload> {
    const [accessToken, refreshToken] = await createTokens(user);
    return {
      accessToken,
      refreshToken,
      user: extractUserPayload(user),
    };
  }
}
