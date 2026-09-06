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

export function toApiProduct(row: DbProductRow): ApiProduct {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    images: row.images ?? [],
    category: row.category,
    subcategory: row.subcategory,
    description: row.description ?? "",
    sizes: row.sizes ?? [],
    colors: row.colors ?? [],
    inStock: row.in_stock,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    badge: (row.badge as ApiProduct["badge"]) || undefined,
    material: row.material || undefined,
    origin: row.origin === "international" ? "international" : "nigerian",
    videoUrl: row.video_url || undefined,
  };
}
