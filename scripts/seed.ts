import { getDatabase } from "@netlify/database";
import bcrypt from "bcryptjs";
import { products } from "../src/data/products";

if (!process.env.NETLIFY_DB_URL) {
  console.error("Missing NETLIFY_DB_URL env var.");
  process.exit(1);
}

const sql = getDatabase().sql;

const DEMO_ACCOUNTS = [
  { name: "iFashion Admin", email: "admin@ifashion.ng", password: "Admin@2025", role: "admin" as const, phone: "+234 801 000 0001", address: "15 Bode Thomas Street, Surulere", state: "Lagos" },
  { name: "Adaeze Okonkwo", email: "ada@ifashion.ng", password: "Ada@2025", role: "user" as const, phone: "+234 802 111 2222", address: "22 Allen Avenue, Ikeja", state: "Lagos" },
  { name: "Emeka Nwosu", email: "emeka@ifashion.ng", password: "Emeka@2025", role: "user" as const, phone: "+234 803 222 3333", address: "5 Wuse Zone 6", state: "FCT - Abuja" },
  { name: "Fatima Bello", email: "fatima@ifashion.ng", password: "Fatima@2025", role: "user" as const, phone: "+234 804 333 4444", address: "10 Bompai Road", state: "Kano" },
];

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

async function seedUsers() {
  let inserted = 0;
  for (const u of DEMO_ACCOUNTS) {
    const rows = await sql`SELECT id FROM users WHERE email = ${u.email}`;
    if (rows.length > 0) continue;
    const passwordHash = await bcrypt.hash(u.password, 10);
    await sql`
      INSERT INTO users (name, email, password_hash, role, phone, address, state)
      VALUES (${u.name}, ${u.email}, ${passwordHash}, ${u.role}, ${u.phone}, ${u.address}, ${u.state})
    `;
    inserted++;
  }
  console.log(`Users: inserted ${inserted}, skipped ${DEMO_ACCOUNTS.length - inserted} (already existed).`);
}

async function main() {
  await seedProducts();
  await seedUsers();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
