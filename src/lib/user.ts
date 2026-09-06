export interface DbUserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "user" | "admin";
  phone: string | null;
  address: string | null;
  state: string | null;
  status: "active" | "suspended";
  created_at: string;
  last_login: string | null;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  phone: string;
  address: string;
  state: string;
  status: "active" | "suspended";
  createdAt: string;
  lastLogin: string | null;
}

export function toSafeUser(row: DbUserRow): SafeUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    phone: row.phone ?? "",
    address: row.address ?? "",
    state: row.state ?? "",
    status: row.status,
    createdAt: row.created_at,
    lastLogin: row.last_login,
  };
}
