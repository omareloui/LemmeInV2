import mongoose from "mongoose";

import { config } from "server/config";

export const connect = async () => {
  await new Promise((resolve, reject) => {
    if (mongoose.connection.readyState === 1) resolve(true);

    mongoose.connect(config.dbLink as string, err => {
      if (err) return reject(err);
      // console.log(`Connected to database on ${config.dbLink}`);
      return resolve(true);
    });
  });
};
