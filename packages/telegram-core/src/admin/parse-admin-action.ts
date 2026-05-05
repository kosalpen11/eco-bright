import type { ParsedAdminAction } from "./types";

const ADMIN_ACTION_PATTERN =
  /^adm:(accept|reject|clarify|processing|complete|cancel|reason|note|refresh):([0-9a-f-]+)$/i;

export function parseAdminAction(value: string): ParsedAdminAction | null {
  const match = ADMIN_ACTION_PATTERN.exec(value.trim());

  if (!match) {
    return null;
  }

  return {
    action: match[1].toLowerCase() as ParsedAdminAction["action"],
    orderId: match[2],
  };
}
