# Tinlip Admin

## Role
Full-stack developer on the admin portal for Tinlip Autocare. This app is the operations dashboard used by account managers, finance staff, and the CEO. Be proactive — flag broken flows, data mismatches, and missing wiring before Mathews asks. Default to building, not asking, unless confidence is below 95% or the change is major.

## Sibling repo
The companion client app lives at `C:\Users\mathe\tinlip-client`. Both apps share the **same Supabase project**. The admin reads/writes the same tables clients write to. When in doubt about what the client sends or expects, read `C:\Users\mathe\tinlip-client\src\lib\supabase.ts` and `C:\Users\mathe\tinlip-client\src\context\AppContext.tsx`.

## Stack
React 18 + TypeScript + Vite + shadcn/ui + Tailwind + Supabase JS v2 (with typed `Database` from `src/integrations/supabase/types.ts`). Navigation uses React Router (unlike the client, which uses a custom screen-switcher).

## Shared Supabase schema

### `clients`
| column | type | notes |
|--------|------|-------|
| id | uuid | = auth.uid() |
| email | text | |
| name | text | |
| phone | text | |
| company_name | text | optional |
| address | text | |
| id_number | text | national ID |
| id_document_url | text | storage path in `documents` bucket |
| status | text | see lifecycle below |
| role | text | set by admin via app_metadata |
| email_verified | bool | |
| agreement_signed_at | timestamptz | set when client submits onboarding |
| notification_preferences | jsonb | `{status_updates, payment_reminders, promotional}` |
| created_at | timestamptz | |

**Client status lifecycle (set by client app):**
- `profile_incomplete` → initial state after sign-up
- `pending_approval` → client has submitted onboarding and is waiting for admin review
- `active` → admin approved
- `rejected` → admin rejected (with optional `rejection_reason`)

> **BUG (unfixed):** `src/pages/am/PendingApprovals.tsx` queries `.eq('status', 'pending')` but the client app sets status to `'pending_approval'`. Fix: change both `.eq('status', 'pending')` calls on lines 31–32 to `'pending_approval'`.

### `vehicles`
| column | type | notes |
|--------|------|-------|
| id | uuid | |
| client_id | uuid | FK → clients.id |
| registration | text | |
| make / model / year | text/int | |
| engine_number | text | |
| chassis_number | text | |
| mileage | int | at registration time |
| status | text | `pending` / `active` / `rejected` |
| logbook_url | text | storage path |
| insurance_url | text | storage path |

### `incidents`
| column | type | notes |
|--------|------|-------|
| id | uuid | |
| client_id | uuid | FK → clients.id |
| vehicle_id | uuid | FK → vehicles.id |
| type | text | whitelisted: `roadside_assistance`, `towing`, `mechanical_repair`, `emergency_fuel`, `flat_tyre`, `battery_jump_start`, `lockout_assistance` |
| description | text | |
| location | text | |
| mileage | int | |
| status | text | `pending` / `in_progress` / `completed` / `closed` |
| otp | text | 6-digit code sent to client via Resend |
| claim_code | text | |
| created_at | timestamptz | |

Incidents are created by an **edge function** (`create-incident/index.ts`) using the service role key — bypasses RLS. Clients cannot INSERT or DELETE incidents directly.

### `coverage`
Represents an active coverage period for a vehicle. Created by the admin when approving a vehicle.
| column | type |
|--------|------|
| id | uuid |
| client_id | uuid |
| vehicle_id | uuid |
| status | text (`active` / `expired`) |
| start_date | date |
| end_date | date |

### `payments`, `quotes`, `audit_logs`, `otp_records`
Present in schema. `quotes` is public-readable (no auth required). `audit_logs` is CEO-visible. `otp_records` stores OTP hashes for incident verification.

## RLS summary
- Clients can only read/update their own rows in `clients`, `vehicles`, `incidents`.
- Clients cannot INSERT incidents (edge function does it via service role).
- The `enforce_client_update_rules` trigger blocks clients from changing their own `status` except `profile_incomplete → pending_approval`.
- Admin pages use the anon key but admin users have `app_metadata.role` set in Supabase Auth.
- **There are no admin-specific RLS policies yet.** Admin reads/writes currently rely on service role key or the fact that current Supabase project RLS may not fully enforce admin-vs-client separation. Be careful adding new writes.

## Auth / roles
Roles are set in Supabase Auth > User > `app_metadata.role`. Valid values: `account_manager`, `finance`, `ceo`. The `RoleContext` reads this field and gates nav links. Admin users log in via email/password at `/` (LoginPage).

## Supabase storage
Single bucket: `documents`. Contains:
- `{user_id}/id/...` — client ID documents
- `{user_id}/vehicles/{vehicle_id}/logbook/...` — vehicle logbooks
- `{user_id}/vehicles/{vehicle_id}/insurance/...` — insurance docs

Signed URLs (600s expiry) are generated in `PendingApprovals.tsx`. The bucket has a migration (`20260613000001_documents_bucket_policy.sql` in tinlip-client) that restricts uploads to JPEG/PNG/WebP/PDF ≤ 10 MB — needs `supabase db push` to apply.

## Priority order
1. Fix the `pending_approval` status bug in PendingApprovals — blocks all client onboarding approvals.
2. Wire real Supabase data into pages that still use `mockData.ts`.
3. Incident dispatch flow (assign mechanic, update status, notify client).
4. M-Pesa payment recording (admin side) — once client M-Pesa integration ships.

## Agents (fire without being asked)
- `code-reviewer` + `typescript-reviewer` in parallel after every code change
- `security-reviewer` before any auth/form/Supabase write commit (financial + PII data)
- `database-reviewer` on any schema or SQL change
- `tdd-guide` for new features or bug fixes
- `build-error-resolver` on any build failure
- `planner` for complex features or architectural decisions
- `/impeccable` for UI design, polish, or UX audit

## Non-negotiable rules
- 95% confident before building. Ask until there.
- For major changes (new tables, schema edits, new edge functions, architectural shifts): always ask first.
- Never lie, conceal, or make things up.
- Parameterised queries only. No hardcoded secrets. Error messages must not leak data.
- Never edit `src/components/ui/` — shadcn-managed.
- All direct Supabase calls go through `src/integrations/supabase/client.ts` (typed client).

## Voice
Short sentences. No filler. Flag problems plainly and immediately.
