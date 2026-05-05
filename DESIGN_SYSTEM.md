# HealTech UI/UX System

## Strategy

HealTech uses a clinical operations design language: calm, structured, information dense, and safe. Staff screens are desktop-first with persistent navigation, visible workflow actions, role-aware tables, and compact forms. The patient portal is simpler and more reassuring, with fewer dense controls and clearer read-only summaries.

## Foundations

- Color: calm medical blue for primary actions, cool slate neutrals for structure, muted semantic tones for status.
- Typography: Inter/Manrope-style hierarchy, tabular numerals for KPIs and table data.
- Spacing: 4px scale, 24px page gutters, 16-24px card padding.
- Radius: 8px cards/buttons/inputs, pills reserved for status chips.
- Elevation: mostly border-based with subtle ambient shadows.
- Icons: Lucide outline icons, monochrome except semantic or primary affordances.

## Information Architecture

- Public: landing, login, forgot password, reset password, verify email, invite acceptance, 403, 404.
- Admin: dashboard, employees, employee details, add employee, departments, leave requests, store/assets, assignments, store requests, patients, visits, reports, settings, audit logs.
- Reception: dashboard, patient search, add patient, patient details, create visit, queue, completed visits.
- Doctor: dashboard, assigned visits, visit details, diagnosis, lab orders, lab results review, medicine orders, completed visits.
- Lab: dashboard, orders queue, order details, enter results, pending, completed, test catalog.
- Pharmacy: dashboard, inventory, add batch, medicine details, low stock, expired, out of stock, order queue, dispensing.
- Patient: dashboard, profile, visits, visit details, lab results, medicines, appointments, notifications, account settings.

## Component Inventory

- App shell: fixed sidebar on desktop, horizontal compact nav on mobile/tablet.
- Page header: eyebrow, title, concise workflow description.
- Data table: sticky header, status badges, role-aware rows, refresh, filtering affordances.
- Toolbar: search, quick status tabs, date/filter/export controls.
- Forms: React Hook Form + Zod, labels, required markers, inline errors, disabled saving state.
- Cards: KPI, chart, activity feed, workflow action, reference IDs, read-only notices.
- Feedback: success/error/warning notices, loading state, no-records state.
- Auth: focused login, show/hide password, remember me, forgot/reset/invite states.

## Accessibility

- WCAG AA-oriented contrast tokens.
- Visible focus ring.
- Semantic headings and labels.
- Status text is not color-only.
- Large click/touch targets.
- Responsive and zoom-friendly layouts.

## Implementation Notes

The UI is driven by `lib/workspaces.ts` so every role route maps to a table/query/action/form contract. `components/workspace-client.tsx` provides the reusable page structure, live Supabase reads, Edge Function actions, dashboard intelligence, table toolbar, and form behavior.
