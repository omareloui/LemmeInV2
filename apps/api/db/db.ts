import { MongoClient } from "../deps.ts";

import { config } from "../config/index.ts";
import { log } from "../utils/index.ts";

const { dbName, mongoUrl } = config;

class Database {
  client = {} as MongoClient;

  private reconnectingTries = 0;

  constructor(public dbName: string, public url: string) {}

  async connect(): Promise<void> {
    try {
      log.info("Database connecting...");
      const client: MongoClient = new MongoClient();
      await client.connect(this.url);
      this.client = client;
      log.info("Database connected!");
      this.reconnectingTries = 0;
    } catch (e) {
      if (this.reconnectingTries >= 5) {
        log.critical(e.message);
        Deno.exit(1);
      }
      this.reconnectingTries++;
      log.info(`Trying reconnecting (${this.reconnectingTries})...`);
      return this.connect();
    }
  }

  get getDatabase() {
    return this.client.database(this.dbName);
  }
}

const db = new Database(dbName, mongoUrl);
await db.connect();

export default db;
