import {
  ensureDir,
  getLogger,
  handlers,
  setup,
  LogRecord,
  join,
} from "../deps.ts";
import { config } from "../config/index.ts";

const { env } = config;
// const currentDate = new Date().toLocaleString();
// const dateForFileName = currentDate.replace(/\//g, "-").replace(/:/g, "_").replace(/,/g, "")
//   .replace(/ [AP]M/, (v: string) => v.trim());
const logFolder = join(".", "logs");
const logFileLocation = join(logFolder, `${env}.log`);

// Create log file if it doesn't exist
await ensureDir(logFolder);

function normalizeMessage(msg: string) {
  const isMsgObject = !!msg.match(/^(\{".+?":.+\})|(\[.+?\])$/);
  if (!isMsgObject) return msg;
  return JSON.stringify(JSON.parse(msg), null, 2);
}

function normalizeObject(obj: Record<string, unknown> | string) {
  if (typeof obj === "object") {
    obj = JSON.stringify(obj, null, 2);
    return obj;
  }
  return obj;
}

function normalizeArgs(args: unknown[]) {
  let result = "";
  args.forEach(
    arg =>
      (result += ` ${normalizeObject(
        arg as Record<string, unknown> | string,
      )}`),
  );
  return result;
}

function getFullMessage({ args, msg }: LogRecord) {
  return `${normalizeMessage(msg)}${normalizeArgs(args)}`;
}

function formatter(logRecord: LogRecord) {
  const { levelName } = logRecord;
  return `[${levelName}] ${getFullMessage(logRecord)}`;
}

function formatterWithDatetime(logRecord: LogRecord) {
  const time = new Date().toISOString();
  return `[${time}] ${getFullMessage(logRecord)}`;
}

await setup({
  handlers: {
    console: new handlers.ConsoleHandler("DEBUG", { formatter }),
    file: new handlers.FileHandler("DEBUG", {
      filename: logFileLocation,
      formatter,
    }),

    productionConsole: new handlers.ConsoleHandler("INFO", {
      formatter: formatterWithDatetime,
    }),
    productionFile: new handlers.FileHandler("INFO", {
      filename: logFileLocation,
      formatter: formatterWithDatetime,
    }),
  },

  loggers: {
    development: { level: "DEBUG", handlers: ["console", "file"] },
    tests: { level: "WARNING", handlers: ["console"] },
    production: {
      level: "INFO",
      handlers: ["productionConsole", "productionFile"],
    },
  },
});

let log = getLogger("development");
if (env === "test") log = getLogger("tests");
else if (env === "production") log = getLogger("production");

export { log };
