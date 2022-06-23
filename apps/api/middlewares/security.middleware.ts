import { Application, Snelm } from "../deps.ts";

const snelm = new Snelm("oak");

export function securityMiddleware(app: Application) {
  app.use(async (ctx, next) => {
    ctx.response = snelm.snelm(ctx.request, ctx.response);
    await next();
  });
}
