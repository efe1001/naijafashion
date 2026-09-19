import { getSql } from "@/lib/db";
import type { SessionPayload } from "@/lib/auth";

export async function logActivity(
  actor: SessionPayload | null,
  action: string,
  entity: string,
  entityId: string | null,
  summary: string
) {
  try {
    const sql = getSql();
    await sql`
      INSERT INTO activity_log (id, actor_id, actor_name, action, entity, entity_id, summary, created_at)
      VALUES (${crypto.randomUUID()}, ${actor?.sub ?? null}, ${actor?.email ?? "system"}, ${action}, ${entity}, ${entityId}, ${summary}, ${new Date().toISOString()})
    `;
  } catch {
    // Logging must never break the action being logged.
  }
}
