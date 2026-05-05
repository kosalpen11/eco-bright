import "server-only";

export function isOrderingEnabled() {
  return process.env.ORDERING_ENABLED === "true";
}

