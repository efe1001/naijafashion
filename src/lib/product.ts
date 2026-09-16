export interface DbProductRow {
  id: string;
  name: string;
  price: string | number;
  original_price: string | number | null;
  images: string[];
  category: string;
  subcategory: string;
  description: string;
  sizes: string[];
  colors: string[];
  in_stock: boolean;
  rating: string | number;
  review_count: number;
  badge: string | null;
  material: string | null;
  origin: string;
  video_url: string | null;
}

export interface ApiProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory: string;
  description: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  rating: number;
  reviewCount: number;
  badge?: "New" | "Sale" | "Hot" | "Limited";
  material?: string;
  origin: "nigerian" | "international";
  videoUrl?: string;
}

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function toApiProduct(row: DbProductRow): ApiProduct {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    images: parseJsonArray(row.images),
    category: row.category,
    subcategory: row.subcategory,
    description: row.description ?? "",
    sizes: parseJsonArray(row.sizes),
    colors: parseJsonArray(row.colors),
    inStock: Boolean(row.in_stock),
    rating: Number(row.rating),
    reviewCount: row.review_count,
    badge: (row.badge as ApiProduct["badge"]) || undefined,
    material: row.material || undefined,
    origin: row.origin === "international" ? "international" : "nigerian",
    videoUrl: row.video_url || undefined,
  };
}
