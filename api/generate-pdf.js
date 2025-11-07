import QRCode from 'qrcode';
import { sql } from './db.js';

export default async function handler(req,res){
  if (req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' });
  try{
    const { product_id, baseUrl } = req.body || {};
    if (!product_id || !baseUrl) return res.status(400).json({ error: 'Missing product_id or baseUrl' });

    const [product] = await sql`SELECT p.*, c.name as customer_name, c.company, c.email
                                FROM products p JOIN customers c ON c.id = p.customer_id
                                WHERE p.id = ${product_id}`;
    if (!product) return res.status(404).json({ error: 'Not found' });

    const public_slug = product.id; // simple slug; you can make nicer ones
    const publicUrl = `${baseUrl}/report.html#${public_slug}`;

    const qrDataUrl = await QRCode.toDataURL(publicUrl);

    // Call PDFMonkey
    const r = await fetch('https://api.pdfmonkey.io/api/v1/documents', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization': `Bearer ${process.env.PDFMONKEY_KEY}`
      },
      body: JSON.stringify({
        document: {
          template_id: process.env.PDFMONKEY_TEMPLATE_ID,
          status: 'pending',
          payload: {
            customer_name: product.customer_name,
            company: product.company,
            email: product.email,
            product_name: product.product_name,
            brand_name: product.brand_name,
            sku: product.sku,
            specs: product.specs,
            qr_public_url: publicUrl,
            qr_png_data_url: qrDataUrl
          }
        }
      })
    });
    const doc = await r.json();

    await sql`INSERT INTO reports (product_id, public_slug) VALUES (${product_id}, ${public_slug})
              ON CONFLICT (public_slug) DO NOTHING`;

    res.json({ pdf_id: doc.id, public_slug });
  }catch(e){
    console.error(e);
    res.status(500).json({ error: 'PDF generation failed' });
  }
}
