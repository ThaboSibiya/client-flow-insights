# P2 Cleanup Plan (items 9–12)

These four items touch many files and several live code paths. Recommending we do them as four small, independently shippable PR-style passes so we can validate after each.

## 9. Consolidate `useCustomerData` variants

Current state — only two true variants exist (not three):
- `useCustomerData.ts` (249 LOC) — main store-backed hook + realtime + fallback query.
- `useSecureCustomerData.ts` (227 LOC) — security-logged variant.
- `useCustomerCustomData.ts` (244 LOC) — different concern (template custom fields), keep separate.

Plan: fold the security/audit-logging behavior of `useSecureCustomerData` into `useCustomerData` behind a `{ audit?: boolean }` option (default `true` for any caller currently importing the secure variant). Re-export `useSecureCustomerData` as a thin alias for one release, then update call sites and delete.

## 10. Merge duplicate security / template / finance service layers

Security cluster (706 LOC across 5):
- Keep: `secureSecurityService.ts` as the canonical impl.
- Fold in: `securityService.ts` (already mostly a deprecated shim), `securityEnhancementService.ts`, `securityMonitoringService.ts`.
- Keep separate: `enhancedSecurityService.ts` (different surface — encrypted PII / threat detection); just re-export shared helpers from the canonical module.

Template cluster (335 LOC across 2):
- Keep: `secureTemplateService.ts` (RLS-aware writes).
- Move pure read helpers from `templateService.ts` in, then delete legacy file. Update ~6 importers.

Finance cluster (685 LOC across 5):
- These are actually distinct concerns (api / business-logic / cache / audit / email) and should stay split. Only "merge" action: move the 26-LOC `financeEmailService.ts` into `financeApiService.ts` since it is a single edge-function call.

## 11. Rename `Customer Insights.tsx` → `CustomerInsights.tsx`

- File is currently orphaned (no route registers it, no import references the page file itself — only the manager component it wraps).
- Safe rename via `git mv` equivalent. No call-site updates needed.

## 12. Split `Integrations.tsx` (752 LOC)

The page uses a single-component filter-chip layout, not tabs. Splitting "into sub-routes" would change URL structure. Two options:

- **A. Sub-routes** — `/integrations/api-triggers`, `/integrations/webhooks`, `/integrations/sync-rules`, with a shared layout shell. Cleanest but changes URLs and requires nav updates.
- **B. Component extraction only** — keep `/integrations` URL, extract `<ApiTriggersSection>`, `<WebhooksSection>`, `<SyncRulesSection>`, `<IntegrationsHeader>` into `src/components/integrations/sections/`. Page becomes ~150 LOC orchestrator. No URL change, no nav change.

Recommend **B** unless you specifically want deep-linkable sub-pages.

## Suggested execution order

1. Item 11 (trivial, isolated rename) — 1 commit.
2. Item 9 (hook consolidation) — verify customers page after.
3. Item 12B (component extraction) — verify integrations page after.
4. Item 10 (service merges) — biggest blast radius, do last with import-site sweep.

## Question before I start

For item 12, do you want **A (sub-routes, URL changes)** or **B (component extraction, same URL)**?
