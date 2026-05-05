# HealTech Clinic Management

Full-stack clinic ERP starter built with Next.js, TypeScript, Tailwind CSS, shadcn-style components, and Supabase migrations.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000/login`.

When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not configured, the app runs in demo mode with role cards for Admin, Reception, Doctor, Lab, Pharmacy, and Patient.

## Supabase

Local Supabase files live under `supabase/`.

```bash
supabase start
supabase db reset
supabase functions serve
```

The initial migration creates the clinic schema, enums, constraints, helper RPCs, RLS policies, and transaction-safe medicine dispensing RPC. Edge Functions implement privileged workflows such as employee creation, visit creation, lab ordering, medicine ordering, dispensing, leave review, and store assignment.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```
