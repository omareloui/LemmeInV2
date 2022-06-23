import { create, getNumericDate, Header, verify } from "../deps.ts";
import { ErrorHelper } from "./index.ts";
import { getDateAfterSeconds } from "../utils/index.ts";

import { config } from "../config/index.ts";
const { jwtExpiration } = config;

const jwtSecret = await crypto.subtle.generateKey(
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);

const header: Header = { alg: "HS512", typ: "JWT" };

export class JwtHelper {
  public static create(
    expiresInSeconds: number,
    payload?: Record<string, unknown>,
  ) {
    return create(
      header,
      {
        iss: "djwt",
        iat: Date.now(),
        exp: getNumericDate(expiresInSeconds),
        ...payload,
      },
      jwtSecret,
    );
  }

  public static async createAccessToken(userId: string) {
    const token = await this.create(jwtExpiration, { id: userId });
    return {
      token,
      expires: getDateAfterSeconds(jwtExpiration),
    };
  }

  public static async verify(token: string) {
    try {
      const isValid = await verify(token, jwtSecret);
      return !!isValid;
    } catch (_e) {
      return false;
    }
  }

  public static async getPayload(token: string) {
    try {
      return await verify(token, jwtSecret);
    } catch (e) {
      let message: string;
      if (e.message.includes("does not match the verification signature"))
        message = `Invalid token`;
      else message = `The token has been expired`;

      ErrorHelper.throw({
        status: ErrorHelper.status.unauthorized,
        name: "Unauthorized",
        path: "access_token",
        param: "access_token",
        message,
        type: "Unauthorized",
      });
    }
  }
}
