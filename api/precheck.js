import crypto from 'crypto';
import { sql, initSchema } from './db.js';
import { sendMail } from './email.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await initSchema();
    const data = req.body || {};
    const { name, company, email, address, password, product_name, brand_name, sku, specs, package_size, origin_country, material } = data;

    if (!name || !email || !product_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const password_hash = password ? crypto.createHash('sha256').update(password).digest('hex') : null;

    const [customer] = await sql`
      INSERT INTO customers (name, company, email, address, password_hash)
      VALUES (${name}, ${company}, ${email}, ${address}, ${password_hash})
      ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, company=EXCLUDED.company, address=EXCLUDED.address
      RETURNING *;
    `;

    const [product] = await sql`
      INSERT INTO products (customer_id, product_name, brand_name, sku, specs, package_size, origin_country, material)
      VALUES (${customer.id}, ${product_name}, ${brand_name}, ${sku}, ${specs}, ${package_size}, ${origin_country}, ${material})
      RETURNING *;
    `;

    // Fire-and-forget email
    sendMail({
      to: email,
      subject: 'Pre-Check erhalten',
      text: `Hallo ${name}, wir haben Ihren Pre-Check für ${product_name} erhalten.`,
      html: `<p>Hallo ${name},</p><p>wir haben Ihren Pre-Check für <strong>${product_name}</strong> erhalten.</p>`
    }).catch(console.error);

    return res.status(200).json({ ok: true, customer_id: customer.id, product_id: product.id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
