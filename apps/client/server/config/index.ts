import dotenv from "dotenv";

export * from "./roles";

dotenv.config();

export const config = {
  dbLink: process.env.DB_URI,

  tokens: {
    access: {
      secret: process.env.ACCESS_TOKEN_SECRET as string,
      expiration: "1m",
    },
    refresh: {
      secret: process.env.REFRESH_TOKEN_SECRET as string,
      expiration: "30d",
    },
  },
};
