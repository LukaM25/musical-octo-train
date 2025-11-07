import Stripe from 'stripe';
import { sql } from './db.js';

const stripe = new Stripe(process.env.STRIPE_KEY);

const priceMap = {
  basic: process.env.STRIPE_PRICE_BASIC_DAILY,
  premium: process.env.STRIPE_PRICE_PREMIUM_DAILY,
  lifetime: process.env.STRIPE_PRICE_LIFETIME,
  priority: process.env.STRIPE_PRICE_PRIORITY
};

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try{
    const { plan, product_id } = req.body || {};
    if (!plan || !priceMap[plan]) return res.status(400).json({ error: 'Unknown plan' });

    const mode = (plan==='lifetime' || plan==='priority') ? 'payment' : 'subscription';
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceMap[plan], quantity: 1 }],
      success_url: `${req.headers.origin}/dashboard.html?success=1`,
      cancel_url: `${req.headers.origin}/preise.html?canceled=1`,
      allow_promotion_codes: true
    });

    if (product_id) {
      await sql`INSERT INTO orders (product_id, plan, stripe_session_id) VALUES (${product_id}, ${plan}, ${session.id})`;
    }

    res.json({ url: session.url });
  }catch(e){
    console.error(e);
    res.status(500).json({ error: 'Stripe error' });
  }
}
