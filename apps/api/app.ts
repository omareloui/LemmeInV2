import { Application, oakCors } from "./deps.ts";
import {
  errorHandler,
  loggerMiddleware,
  securityMiddleware,
} from "./middlewares/index.ts";
import { log } from "./utils/index.ts";
import { config } from "./config/index.ts";
import router from "./routers/index.ts";

const { url, port, host } = config;

const app = new Application();

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 200,
  credentials: true,
};

securityMiddleware(app);
loggerMiddleware(app);
app.use(oakCors(corsOptions));
app.use(errorHandler);

router.init(app);

app.addEventListener("listen", () => {
  log.info(`Server listening at ${url}`);
});

if (import.meta.main) {
  await app.listen({ port, hostname: host });
}

export { app };
