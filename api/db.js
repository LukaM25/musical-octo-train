import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL);

// One-time init helper (safe to call; create tables if missing)
export async function initSchema() {
  await sql`CREATE TABLE IF NOT EXISTS customers(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT,
    email TEXT UNIQUE NOT NULL,
    address TEXT,
    password_hash TEXT,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS products(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    product_name TEXT NOT NULL,
    brand_name TEXT,
    sku TEXT,
    specs TEXT,
    package_size TEXT,
    origin_country TEXT,
    material TEXT,
    status TEXT DEFAULT 'precheck_submitted',
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS orders(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    product_id UUID REFERENCES products(id),
    plan TEXT NOT NULL,
    stripe_session_id TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS licenses(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    valid_from DATE,
    valid_to DATE,
    status TEXT DEFAULT 'inactive',
    type TEXT, -- '3y'|'forever'
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS reports(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    pdf_url TEXT,
    public_slug TEXT UNIQUE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS certificates(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    pdf_url TEXT,
    seal_number TEXT,
    qr_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
}
