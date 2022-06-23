import * as trpc from "@trpc/server";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { z } from "zod";

type Context = {};

export const appRouter = trpc.router<Context>().query("hello", {
  input: z
    .object({
      name: z.string(),
    })
    .nullish(),
  resolve: ({ input }) => ({
    text: `hello ${input?.name ?? "world"}`,
  }),
});
export type AppRouter = typeof appRouter;

const { listen } = createHTTPServer({
  router: appRouter,
  createContext() {
    return {};
  },
});

listen(2022);
