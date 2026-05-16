# HealTech

HealTech is a multi-role clinic management / clinic ERP system built with Next.js, TypeScript, Tailwind CSS, shadcn-style components, and Supabase migrations.

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

## Vercel

The project is ready to import into Vercel as a Next.js app. Vercel should use the settings from `vercel.json`:

- Install Command: `npm install`
- Build Command: `npm run build`
- Development Command: `npm run dev`
- Node.js: `22.x`

Add these Environment Variables in Vercel before connecting to a live Supabase project:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` is only needed for trusted server environments and Supabase Edge Functions. Do not expose it as a `NEXT_PUBLIC_` variable.

## Azure AI Foundry Workflow

HealTech routes AI chat requests through a server-side Next.js API route. The browser calls `/api/healtech-chat`; the frontend must never call Azure AI Foundry directly.

Add these values to `.env.local` for local development:

```bash
AZURE_FOUNDRY_WORKFLOW_ENDPOINT=
AZURE_FOUNDRY_API_VERSION=2025-11-15-preview
```

Use the published workflow endpoint for `AZURE_FOUNDRY_WORKFLOW_ENDPOINT`. Do not prefix Azure variables with `NEXT_PUBLIC_`, and do not commit real endpoint values, tenant IDs, secrets, or tokens.

For local authentication, run:

```bash
az login
```

For deployment, configure a service principal or managed identity. The caller identity needs Azure AI User permission on the published Agent Application, or an equivalent scope that can invoke the workflow.

After deploying, add the Vercel domain to Supabase Auth redirect URLs, including:

```text
https://your-vercel-domain.vercel.app/auth/callback
https://your-vercel-domain.vercel.app/reset-password
```
