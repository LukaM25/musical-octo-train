# Blocs → Vercel Starter (Neon + Stripe + PDFMonkey)

This is a minimal backend you can deploy to Vercel and call from your Blocs-exported static site.

## Quick start
1. Copy this folder to a new repo.
2. `cp .env.example .env` and fill in values.
3. `npm install`
4. `vercel` (or push to a Vercel-connected repo)
5. In Blocs, point your form/actions to these endpoints:
   - POST `/api/precheck`
   - POST `/api/checkout` with `{ plan, product_id }`
   - POST `/api/generate-pdf` with `{ product_id, baseUrl }`
   - GET  `/api/report/{id}` for public verification

## Notes
- Webhook signature verification: for production, prefer Next.js API routes with `bodyParser:false` to verify Stripe signatures.
- Neon connection: use pooled connection string (with `-pooler` and `sslmode=require`).
- All functions are written in ESM and Node 18.
