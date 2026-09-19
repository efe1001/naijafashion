import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

interface DbReviewRow {
  id: string;
  product_id: string;
  user_id: string | null;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

async function recomputeRating(productId: string) {
  const sql = getSql();
  await sql`
    UPDATE products SET
      rating = COALESCE((SELECT ROUND(AVG(rating), 1) FROM reviews WHERE product_id = ${productId}), 0),
      review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ${productId})
    WHERE id = ${productId}
  `;
}

async function hasPurchased(userId: string, email: string, productId: string) {
  const sql = getSql();
  const rows = await sql`
    SELECT 1 AS ok FROM orders o, json_each(o.items) j
    WHERE (o.user_id = ${userId} OR lower(o.customer_email) = ${email.toLowerCase()})
      AND o.status NOT IN ('cancelled', 'refunded')
      AND json_extract(j.value, '$.productId') = ${productId}
    LIMIT 1
  `;
  return rows.length > 0;
}

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });

  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM reviews WHERE product_id = ${productId} ORDER BY created_at DESC LIMIT 100
  `) as unknown as DbReviewRow[];

  const session = await getSessionFromRequest(request);
  let canReview = false;
  let hasReviewed = false;
  if (session) {
    hasReviewed = rows.some((r) => r.user_id === session.sub);
    canReview = !hasReviewed && (await hasPurchased(session.sub, session.email, productId));
  }

  return NextResponse.json({
    reviews: rows.map((r) => ({
      id: r.id,
      productId: r.product_id,
      userId: r.user_id,
      userName: r.user_name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
    })),
    canReview,
    hasReviewed,
    isLoggedIn: !!session,
  });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Please log in to leave a review" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const productId = typeof body?.productId === "string" ? body.productId : "";
  const rating = Number(body?.rating);
  const comment = typeof body?.comment === "string" ? body.comment.trim().slice(0, 1000) : "";
  if (!productId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Choose a rating from 1 to 5" }, { status: 400 });
  }

  if (!(await hasPurchased(session.sub, session.email, productId))) {
    return NextResponse.json({ error: "Only customers who bought this product can review it" }, { status: 403 });
  }

  const sql = getSql();
  const existing = await sql`SELECT id FROM reviews WHERE product_id = ${productId} AND user_id = ${session.sub}`;
  if (existing.length > 0) return NextResponse.json({ error: "You already reviewed this product" }, { status: 409 });

  const users = (await sql`SELECT name FROM users WHERE id = ${session.sub}`) as unknown as { name: string }[];
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO reviews (id, product_id, user_id, user_name, rating, comment, created_at)
    VALUES (${id}, ${productId}, ${session.sub}, ${users[0]?.name ?? "Customer"}, ${rating}, ${comment}, ${new Date().toISOString()})
  `;
  await recomputeRating(productId);
  return NextResponse.json({ ok: true, id }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const sql = getSql();
  const rows = (await sql`SELECT * FROM reviews WHERE id = ${id}`) as unknown as DbReviewRow[];
  const review = rows[0];
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
  if (session.role !== "admin" && review.user_id !== session.sub) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  await sql`DELETE FROM reviews WHERE id = ${id}`;
  await recomputeRating(review.product_id);
  if (session.role === "admin") {
    await logActivity(session, "delete", "review", id, `Deleted a ${review.rating}★ review by ${review.user_name}`);
  }
  return NextResponse.json({ ok: true });
}
