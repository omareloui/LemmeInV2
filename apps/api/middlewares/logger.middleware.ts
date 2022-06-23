import { Application } from "../deps.ts";
import { log } from "../utils/index.ts";

export function loggerMiddleware(app: Application) {
  app.use(async ({ response, request }, next) => {
    await next();
    const responseTime = response.headers.get("X-Response-Time");
    const { status } = response;
    const { method, url, ip } = request;
    const message = `${method} [${status}] (${ip}) ${url} - ${responseTime}`;

    // Set the log function
    if (status < 400) log.info(message);
    else if (status >= 400 && status < 500) log.warning(message);
    else if (status >= 500) log.critical(message);
  });

  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.response.headers.set("X-Response-Time", `${ms}ms`);
  });
}
