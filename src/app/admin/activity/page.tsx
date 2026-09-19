"use client";

import { useCallback, useEffect, useState } from "react";
import { History, ChevronLeft, ChevronRight } from "lucide-react";

interface Entry {
  id: string;
  actor_name: string;
  action: string;
  entity: string;
  summary: string;
  created_at: string;
}

const ENTITIES = ["", "product", "order", "user", "category", "coupon", "review", "settings"];
const actionColor: Record<string, string> = {
  create: "bg-green-100 text-green-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
};

export default function ActivityPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState("");
  const [loading, setLoading] = useState(true);
  const pageSize = 30;

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/activity?page=${page}&pageSize=${pageSize}&entity=${entity}`);
    if (res.ok) {
      const data = await res.json();
      setEntries(data.entries);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page, entity]);

  useEffect(() => {
    load();
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2"><History size={24} /> Activity Log</h1>
          <p className="text-gray-500 text-sm">Who changed what, and when · {total} entries</p>
        </div>
        <select
          value={entity}
          onChange={(e) => { setEntity(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {ENTITIES.map((e) => <option key={e} value={e}>{e ? e : "All activity"}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
        {loading && <p className="p-8 text-center text-sm text-gray-400">Loading...</p>}
        {!loading && entries.length === 0 && <p className="p-8 text-center text-sm text-gray-400">No activity recorded yet.</p>}
        {entries.map((e) => (
          <div key={e.id} className="flex items-start gap-3 px-5 py-3.5">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize mt-0.5 ${actionColor[e.action] ?? "bg-gray-100 text-gray-600"}`}>{e.action}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800">{e.summary}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {e.actor_name} · {e.entity} · {new Date(e.created_at.includes("T") ? e.created_at : e.created_at.replace(" ", "T") + "Z").toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"><ChevronLeft size={16} /></button>
        <span className="text-sm text-gray-600">Page {page} of {pages}</span>
        <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="p-2 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}
