import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";
import { assertServerOnlyRuntime, getRequiredEnv } from "@/lib/utils/env";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  assertServerOnlyRuntime("Database client");

  if (!dbInstance) {
    const connection = neon(getRequiredEnv("DATABASE_URL"));
    dbInstance = drizzle({
      client: connection,
      schema,
    });
  }

  return dbInstance;
}
