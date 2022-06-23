import { Context } from "../deps.ts";

import { config } from "../config/index.ts";
import { log } from "../utils/index.ts";
import { ErrorHelper } from "../helpers/index.ts";

const { env } = config;

export async function errorHandler(
  { response }: Context,
  next: () => Promise<unknown>,
) {
  try {
    await next();
  } catch (err) {
    const message = err.message;
    const name = err.name;
    const path = err.path;
    const type = err.type;
    const status =
      err.status || err.statusCode || ErrorHelper.status.internalServerError;

    if (env !== "production") {
      if (status >= 400 && status < 500) log.warning(message);
      else if (status >= 500) log.critical(message);
    }

    response.status = status;
    response.body = { message, name, path, type, status };
  }
}
