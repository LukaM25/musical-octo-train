import { sql } from '../db.js';

export default async function handler(req, res){
  const { id } = req.query; // /api/report/[id]
  if (!id) return res.status(400).json({ error: 'Missing id' });
  try{
    const rows = await sql`SELECT p.product_name, p.brand_name, p.sku, p.specs, p.status,
                                  r.pdf_url, r.public_slug, r.published_at,
                                  l.valid_from, l.valid_to, l.status as license_status, l.type
                           FROM products p
                           LEFT JOIN reports r ON r.product_id = p.id
                           LEFT JOIN licenses l ON l.product_id = p.id
                           WHERE p.id = ${id} OR r.public_slug = ${id}
                           LIMIT 1`;
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  }catch(e){
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
}
