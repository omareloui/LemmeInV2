import jwt from "jsonwebtoken";

import { User } from "server/models";

import type {
  User as UserInterface,
  Token,
  AccessTokenContent,
  RefreshTokenContent,
  AuthenticationPayload,
} from "types";
import { config } from "server/config";

const {
  tokens: { access: accessConfig, refresh: refreshTokenConfig },
} = config;

export function extractUserPayload(
  user: UserInterface,
): AuthenticationPayload["user"] {
  return {
    _id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    isValidEmail: user.isValidEmail,
    role: user.role,
  };
}

export function createTokens(user: UserInterface): [Token, Token] {
  const token = jwt.sign(
    extractUserPayload(user) as AccessTokenContent,
    accessConfig.secret,
    { expiresIn: accessConfig.expiration },
  );

  const refreshToken = jwt.sign(
    { _id: user._id.toString() } as RefreshTokenContent,
    `${refreshTokenConfig.secret}${user.password}`,
    {
      expiresIn: refreshTokenConfig.expiration,
    },
  );

  return [
    { body: token, expiration: accessConfig.expiration },
    { body: refreshToken, expiration: refreshTokenConfig.expiration },
  ];
}

export function verifyToken<T extends RefreshTokenContent | AccessTokenContent>(
  token: string,
  secret: string,
): T {
  return jwt.verify(token, secret) as T;
}

export function decodeToken<T extends RefreshTokenContent | AccessTokenContent>(
  token: string,
): T {
  return jwt.decode(token) as T;
}

export async function refreshTokens(
  refreshToken: string,
): Promise<AuthenticationPayload> {
  let userId: string;

  try {
    const { _id: id } = decodeToken<RefreshTokenContent>(refreshToken);
    userId = id;
  } catch (err) {
    throw createError({ message: "Invalid refresh token.", statusCode: 401 });
  }

  if (!userId)
    throw createError({ message: "Invalid refresh token.", statusCode: 401 });

  const user = (await User.findOne({ _id: userId })) as
    | UserInterface
    | undefined;

  if (!user)
    throw createError({
      message: "Can't find the token user.",
      statusCode: 401,
    });

  const refreshSecret = `${refreshTokenConfig.secret}${user.password}`;

  try {
    verifyToken(refreshToken, refreshSecret);
  } catch (err) {
    throw createError({ message: "Invalid token.", statusCode: 401 });
  }

  const [newToken, newRefreshToken] = createTokens(user);

  return {
    accessToken: newToken,
    refreshToken: newRefreshToken,
    user: extractUserPayload(user),
  };
}
