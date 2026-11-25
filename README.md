# Fromage planning workspace

A static, illustrative minimum-run and retail growth planning demonstration prepared by ScaleSight. Operating numbers and selected production flavours are synthetic; this is not an approved Fromage plan or evidence of achieved results.

## Run locally

Requires Node 22+ and pnpm 11.

```sh
pnpm install
pnpm dev
pnpm validate
pnpm e2e
```

The local app opens at http://localhost:3100. `pnpm build` produces `dist/`; `pnpm preview` serves that static build. No runtime service, credentials, analytics or external requests are used. Inter and Manrope are served from bundled font files.

## Routes

- `/brief`: the current production decision, expansion and evidence.
- `/demand-stock`: shipment history, forecast formation, opening stock and the weekly ledger.
- `/production`: minimum runs, dates, independent-run feasibility, receipt delay and payments.
- `/expansion`: prospective opening fills, recurring requirements and opening-date comparison.
- `/options`: fixed S1/S2/S3 central comparison, production payments and unchanged-production stress cases.

Root and unknown routes redirect to `/brief`. Sources & assumptions, This week’s review, About this example and the public catalogue open as accessible modal drawers.

## Data and calculations

`src/data/fixture.ts` owns typed raw inputs, scenario definitions and four decision records. `src/engine/model.ts` computes forecast-consumed requirements, receipts, per-flavour stock/backlog, payments and summaries using integer CAD cents. `src/copy/literal.ts` preserves PDF interface copy; case text binds to calculated outputs in `src/copy/selectors.ts`. Draft variants are marked `DRAFT_NEEDS_APPROVAL` in `src/copy/drafted.ts`.

Scenario, independent-run feasibility and product selection persist in the URL (`case`, `runs`, `sku`). Presets replace the complete case and preserve feasibility. Only reset restores S1 plus assumed separate runs. S2 remains inspectable as an infeasible comparison when separate runs are unavailable. The options comparison always stays central demand plus W5 opening.

Account filtering changes historical shipments only. Chart demand-layer visibility does not change calculations. Catalogue-only flavours have null operating values. Negative net stock represents outstanding requirement; physical stock is never negative. Storage is a proxy based on weekly closing stock, never an invoice or realised saving.

## Verification

```sh
pdftotext -layout docs/ScaleSight_Fromage_Technical_Specification_Wahib_v1.pdf docs/spec.txt
python3 scripts/extract-golden.py
pnpm validate
pnpm e2e
```

Extraction requires `pdftotext` and Python `pypdf`. Golden JSON is committed: 72 shipment rows, 288 net positions and 1,728 ledger values. Unit tests map all 20 release checks, verify literal-copy provenance, scenario transitions, strict buffer comparisons, financial summaries and colour contrast. Playwright checks all five routes at 1440, 1024, 768, 390 and 360 pixels, axe accessibility, disclosures, overflow, local-only requests, modal focus return and the live feasibility sequence. Screenshots are written to ignored `test-results/screenshots/`.

Only `dist/` is publicly served. The PDF, extracted specification and tests stay outside that output. The eight public source links are mapped in specification-register order from PDF annotations; the ninth annotation is a duplicate Fiona profile host variant.

## New preview deployment only

This checkout arrived with an existing Git remote. It has not been pushed, relinked or redeployed. No `.vercel` project identity was inherited. Do not attach to the reference demo or another existing project.

If authenticated GitHub/Vercel CLIs are available, create a fresh private remote and a new Vercel project:

```sh
gh repo create scalesight-fromage-demo --private
# Use the URL returned above, without changing the existing origin:
git remote add fromage-demo git@github.com:YOUR_ACCOUNT/scalesight-fromage-demo.git
git push -u fromage-demo main
vercel link --project scalesight-fromage-demo
# At the prompt, create a NEW project; do not select an existing project.
# Inspect .vercel/project.json to confirm the new project before deployment.
vercel deploy
# Deploy without --prod. Then test the exact returned preview URL:
PREVIEW_URL=https://YOUR_NEW_PREVIEW.vercel.app pnpm e2e
```

If that Vercel project name is already used, create `scalesight-fromage-planning` instead. Do not change team authentication settings. A preview may require Vercel Authentication; its access status must be reported after deployment, and cannot be inferred locally.

`index.html` has noindex/nofollow, `public/robots.txt` disallows all crawlers, and `vercel.json` sets the `X-Robots-Tag` header plus SPA rewrites. No existing deployment is modified by local builds.

## Scope and tooling

React + TypeScript + Vite, React Router, hand-written SVG/CSS charts, Vitest, Playwright, axe and self-hosted fonts. Build/development dependencies beyond the requested list are Vite, TypeScript, ESLint, typescript-eslint and type definitions; `react-dom` is the required React renderer. No product imagery or code from the reference application is used in the new app.

Production payment charts use three option groups per payment week with deposits and balances stacked; infeasible S2 is removed from the actionable chart and retained in a labelled explanation. Manufacturing terms, capacity and usable-until dates remain illustrative and require business confirmation.
