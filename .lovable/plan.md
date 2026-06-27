# Demo Account for Sales Demos

A zero-friction "Try Demo" experience for the sales team. Prospects click one button on a public page and land in a fully-functional, pre-seeded workspace. Everything resets every hour, so the next demo always starts clean.

## What the user experiences

1. Sales rep (or prospect) visits `/demo` — public route, no signup.
2. One button: **"Launch Demo"**.
3. Behind the scenes, they're auto-signed in as the shared demo user and dropped on the dashboard inside the demo workspace.
4. A persistent banner across the top reads: **"DEMO MODE — data resets hourly. External actions (email, SMS, payments) are disabled."**
5. They can click anything, drag pipeline cards, create customers, add tickets, open invoices, etc. — feels like the real product.
6. Destructive/external actions (sending real emails via Resend, SMS via Twilio, charging via Paystack, inviting real users, deleting the workspace, changing plan) are blocked with a friendly toast: *"Disabled in demo mode."*

## How it works (technical)

### Database (one migration)
- Add `is_demo BOOLEAN DEFAULT false` to `profiles` and `workspaces`.
- Seed one demo user (`demo@quikle.co.za`) and one demo workspace marked `is_demo = true`, plan `Team`, status `active` (no trial timer).
- New `public.seed_demo_workspace()` SECURITY DEFINER function that:
  - Deletes all rows in the demo workspace (customers, tickets, invoices, payments, projects, conversations, equipment, etc.).
  - Re-inserts a curated dataset: ~25 customers, ~15 tickets across stages, ~10 invoices (paid/pending/overdue mix), ~8 projects, ~5 conversations, sample equipment & service history.
- New `public.is_demo_user()` helper (checks `profiles.is_demo` for `auth.uid()`).
- pg_cron job: runs `seed_demo_workspace()` every hour on the hour.

### Edge function: `demo-signin`
- Public (no JWT required).
- Uses `SUPABASE_SERVICE_ROLE_KEY` to mint a session for `demo@quikle.co.za` via `admin.generateLink({ type: 'magiclink' })`, returns the session tokens to the client.
- Rate-limited (e.g., 30 launches per IP per hour) to prevent abuse.

### Frontend
- New public route `/demo` → `<DemoLanding />` with hero copy + "Launch Demo" button.
- Button calls `demo-signin`, sets the returned session via `supabase.auth.setSession()`, navigates to `/`.
- New `useIsDemoMode()` hook (reads `profiles.is_demo` for current user, cached).
- New `<DemoBanner />` rendered in `AppLayout` when `useIsDemoMode()` is true.
- Guardrail helper `assertNotDemo(action)` wrapped around:
  - Resend send-email calls
  - Twilio SMS calls
  - Paystack subscription/upgrade calls
  - Workspace delete, member invite, plan change
  - Any webhook outbound POST
- Returns a toast: *"This action is disabled in demo mode."*

## What it does NOT change
- No impact on real users, real workspaces, real billing.
- Real Auth flow untouched — demo is purely additive.
- No changes to RLS for non-demo workspaces.

## Out of scope (can add later)
- Per-session ephemeral users.
- Demo analytics ("which prospects clicked what").
- Walk-through tour overlay (we have the feature tour system already).

## Files to create / edit

**New:**
- `supabase/migrations/<ts>_demo_account.sql` — schema, seed function, cron, demo user
- `supabase/functions/demo-signin/index.ts` — public session minting
- `src/pages/DemoLanding.tsx` — public landing page
- `src/hooks/useIsDemoMode.ts`
- `src/components/demo/DemoBanner.tsx`
- `src/lib/demo-guard.ts` — `assertNotDemo()` helper

**Edit:**
- `src/App.tsx` — register `/demo` route (public)
- `src/components/layout/AppLayout.tsx` (or equivalent) — mount `<DemoBanner />`
- A handful of action handlers (email send, SMS send, plan change, workspace delete, member invite) — wrap with `assertNotDemo()`

## Manual step after migration
The user (or I, via secrets tool) must set a password for `demo@quikle.co.za` so it can be signed in. I'll handle this via the migration using `auth.users` admin insert with a known hashed password, OR via the edge function using `admin.generateLink` (preferred — no password needed).
