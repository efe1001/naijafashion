export type SqlRow = Record<string, unknown>;

export interface Sql {
  <T extends SqlRow = SqlRow>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]>;
}

interface D1QueryResult {
  results: SqlRow[];
  success: boolean;
  meta?: Record<string, unknown>;
  error?: string;
}

interface D1ApiResponse {
  result: D1QueryResult[];
  success: boolean;
  errors: { code: number; message: string }[];
}

function bindValue(value: unknown): unknown {
  if (typeof value === "boolean") return value ? 1 : 0;
  if (value === undefined) return null;
  return value;
}

async function runQuery<T extends SqlRow>(sqlText: string, params: unknown[]): Promise<T[]> {
  const accountId = process.env.CF_ACCOUNT_ID;
  const databaseId = process.env.CF_D1_DATABASE_ID;
  const token = process.env.CF_D1_API_TOKEN;
  if (!accountId || !databaseId || !token) {
    throw new Error("Cloudflare D1 is not configured (CF_ACCOUNT_ID / CF_D1_DATABASE_ID / CF_D1_API_TOKEN)");
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql: sqlText, params: params.map(bindValue) }),
    }
  );

  const data = (await res.json()) as D1ApiResponse;
  if (!res.ok || !data.success) {
    const message = data.errors?.map((e) => e.message).join("; ") || `D1 query failed (${res.status})`;
    throw new Error(message);
  }

  return (data.result[0]?.results ?? []) as T[];
}

export function getSql(): Sql {
  return (async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const sqlText = strings.reduce((acc, part, i) => acc + (i > 0 ? "?" : "") + part, "");
    return runQuery(sqlText, values);
  }) as Sql;
}
