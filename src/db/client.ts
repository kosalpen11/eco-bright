import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@/db/schema";
import { assertServerOnlyRuntime, getRequiredEnv } from "@/lib/utils/env";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let poolInstance: Pool | null = null;

export function getDb() {
  assertServerOnlyRuntime("Database client");

  if (!dbInstance) {
    neonConfig.webSocketConstructor = ws;
    poolInstance = new Pool({
      connectionString: getRequiredEnv("DATABASE_URL"),
    });

    poolInstance.on("error", (error: Error) => {
      console.error("Neon pool error", error);
    });

    dbInstance = drizzle({
      client: poolInstance,
      schema,
    });
  }

  return dbInstance;
}
