export function getRequiredEnv(name: string, value = process.env[name]) {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`Missing required env: ${name}. Add it to .env.local.`);
  }

  return normalized;
}

export function assertServerOnlyRuntime(context: string) {
  if (typeof window !== "undefined") {
    throw new Error(`${context} can only run on the server.`);
  }
}
