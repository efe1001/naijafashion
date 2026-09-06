import { getDatabase } from "@netlify/database";
import type { SQL } from "waddler";

let cached: SQL | null = null;

export function getSql(): SQL {
  if (cached) return cached;
  cached = getDatabase().sql;
  return cached;
}
