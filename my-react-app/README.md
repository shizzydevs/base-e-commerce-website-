# Local Harvest Hub

A React and Supabase marketplace for local goods. It supports authenticated saved carts and server-authoritative cash-on-delivery orders.

## Setup

1. Copy `.env.example` to `.env.local` and set your public Supabase URL and anon key.
2. Run `supabase/migrations/20260829_production_baseline.sql` in the Supabase SQL Editor.
3. Run `npm run dev`.

Do not put a Supabase service-role key in the frontend. Confirm that `products` has the columns noted at the top of the SQL migration before running it.

## Commands

- `npm run lint`
- `npm run test`
- `npm run build`

## Payments

This release accepts cash on delivery only. It deliberately does not collect card data. To offer card payments, add a server-side Stripe Checkout or Payment Element integration and verify provider webhooks before marking orders paid.
