import Stripe from 'stripe';
import { sql } from './db.js';

const stripe = new Stripe(process.env.STRIPE_KEY);

// NOTE: In Vercel Serverless Functions (non-Next.js), req.body is already parsed.
// If signature verification is required, switch to a raw body approach or move this route into Next.js API with bodyParser disabled.
export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const event = req.body;

    if (event.type === 'checkout.session.completed') {
      const s = event.data.object;
      // link order by session id
      await sql`UPDATE orders SET paid_at = now() WHERE stripe_session_id = ${s.id}`;

      // start license timers where applicable (example: 3 years for basic/premium)
      // You may also read line items to decide type
      // Here we leave as a placeholder; implement after pricing is finalized.
    }

    return res.json({ received: true });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Webhook handler error' });
  }
}
