import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import * as schema from "./schema/index.js";

export type AppDatabase = NeonDatabase<typeof schema>;

export type DatabaseHandle = {
  db: AppDatabase;
  end: () => Promise<void>;
};

if (typeof WebSocket !== "undefined") {
  neonConfig.webSocketConstructor = WebSocket;
}

export function isDatabaseConfigured(url: string | undefined = process.env["DATABASE_URL"]): boolean {
  return Boolean(url && url.trim().length > 0);
}

/** Create a Neon Drizzle client with transactions. Do not call at module import. Never log the URL. */
export function createDb(databaseUrl: string): DatabaseHandle {
  const pool = new Pool({ connectionString: databaseUrl });
  return {
    db: drizzle(pool, { schema }),
    end: async () => {
      await pool.end();
    },
  };
}
