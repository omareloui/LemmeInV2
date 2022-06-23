import { Application } from "../deps.ts";

import defaultRouter from "./default.router.ts";
import authRouter from "./auth.router.ts";
import tagRouter from "./tag.router.ts";
import noteRouter from "./note.router.ts";
import accountRouter from "./account.router.ts";
import resourcesRouter from "./resources.router.ts";

const init = (app: Application) => {
  [
    authRouter,
    tagRouter,
    noteRouter,
    accountRouter,
    resourcesRouter,
    defaultRouter,
  ].forEach(router => {
    app.use(router.routes());
    app.use(router.allowedMethods());
  });
};

export default { init };
