import { Context, Router, send } from "../deps.ts";

import { config } from "../config/index.ts";

const { env } = config;

const router = new Router();

router.get("/(.*)", async (context: Context) => {
  if (env === "production") {
    const path = context.request.url.pathname.split("/")[1];
    let resource = context.request.url.pathname;
    const options = { root: Deno.cwd() };
    if (path !== "build") {
      resource = "build/index.html";
    }
    await send(context, resource, options);
  } else {
    context.response.status = 200;
    context.response.body = "ready";
  }
});

export default router;
