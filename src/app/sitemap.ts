import type { MetadataRoute } from "next";
import { getSql } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = ["", "/products", "/track"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const sql = getSql();
    const [products, categories] = await Promise.all([
      sql`SELECT id, created_at FROM products WHERE status = 'active'`,
      sql`SELECT slug FROM categories`,
    ]);
    return [
      ...pages,
      ...(categories as { slug: string }[]).map((c) => ({
        url: `${SITE_URL}/category/${c.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...(products as { id: string; created_at: string }[]).map((p) => ({
        url: `${SITE_URL}/product/${p.id}`,
        lastModified: new Date(p.created_at.includes("T") ? p.created_at : p.created_at.replace(" ", "T") + "Z"),
        changeFrequency: "weekly" as const,
        priority: 0.9,
      })),
    ];
  } catch {
    return pages;
  }
}
