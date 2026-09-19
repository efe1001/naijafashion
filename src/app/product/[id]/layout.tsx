import type { Metadata } from "next";
import { cache } from "react";
import { getSql } from "@/lib/db";
import { toApiProduct, DbProductRow } from "@/lib/product";
import { SITE_URL } from "@/lib/site";

const loadProduct = cache(async (id: string) => {
  try {
    const rows = (await getSql()`SELECT * FROM products WHERE id = ${id} AND status = 'active'`) as unknown as DbProductRow[];
    return rows[0] ? toApiProduct(rows[0]) : null;
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await loadProduct(id);
  if (!product) return { title: "Product not found | iFashion" };

  const description = (product.description || `Buy ${product.name} at iFashion.`).slice(0, 160);
  return {
    title: `${product.name} | iFashion`,
    description,
    alternates: { canonical: `/product/${product.id}` },
    openGraph: {
      title: product.name,
      description,
      url: `/product/${product.id}`,
      images: product.images[0] ? [{ url: product.images[0], alt: product.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title: product.name, description, images: product.images[0] ? [product.images[0]] : undefined },
  };
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await loadProduct(id);

  const jsonLd = product && {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.id,
    url: `${SITE_URL}/product/${product.id}`,
    ...(product.reviewCount > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount },
    }),
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: product.price,
      availability: product.inStock && product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      {children}
    </>
  );
}
