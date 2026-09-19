import { getSql } from "../src/lib/db";
import bcrypt from "bcryptjs";
import { products } from "../src/data/products";

if (!process.env.CF_ACCOUNT_ID || !process.env.CF_D1_DATABASE_ID || !process.env.CF_D1_API_TOKEN) {
  console.error("Missing CF_ACCOUNT_ID / CF_D1_DATABASE_ID / CF_D1_API_TOKEN env vars.");
  process.exit(1);
}

const sql = getSql();

async function seedProducts() {
  let inserted = 0;
  for (const p of products) {
    const rows = await sql`SELECT id FROM products WHERE id = ${p.id}`;
    if (rows.length > 0) continue;
    await sql`
      INSERT INTO products (
        id, name, price, original_price, images, category, subcategory, description,
        sizes, colors, in_stock, rating, review_count, badge, material, origin
      ) VALUES (
        ${p.id}, ${p.name}, ${p.price}, ${p.originalPrice ?? null}, ${JSON.stringify(p.images)},
        ${p.category}, ${p.subcategory}, ${p.description}, ${JSON.stringify(p.sizes)}, ${JSON.stringify(p.colors)},
        ${p.inStock}, ${p.rating}, ${p.reviewCount}, ${p.badge ?? null}, ${p.material ?? null}, ${p.origin}
      )
    `;
    inserted++;
  }
  console.log(`Products: inserted ${inserted}, skipped ${products.length - inserted} (already existed).`);
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("Admin: ADMIN_EMAIL / ADMIN_PASSWORD not set, skipping.");
    return;
  }
  const rows = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (rows.length > 0) {
    console.log("Admin: already exists, skipped.");
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await sql`
    INSERT INTO users (id, name, email, password_hash, role)
    VALUES (${crypto.randomUUID()}, ${process.env.ADMIN_NAME || "Admin"}, ${email}, ${passwordHash}, 'admin')
  `;
  console.log("Admin: created " + email);
}

async function main() {
  await seedProducts();
  await seedAdmin();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
