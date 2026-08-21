# Binaa Construction ERP Prototype

Interactive, local-first ERP prototype for construction companies, contractors, engineering offices, and project-control teams. The current milestone connects company and project master data with BOQ, procurement, inventory, expenses, certificates, accounting, costing, documents, and the executive dashboard.

## Architecture

```text
Presentation (Next.js / React)
  → Application actions
  → Business calculation services
  → Repository interfaces
  → LocalStorage repository (temporary prototype)
```

Business calculations live outside React components. `ErpRepository` can later be implemented by an API repository without rewriting the user interface or calculation engine. `FileStorageProvider` is represented as an interface; the prototype intentionally stores attachment metadata only.

## Technology

Next.js, React, strict TypeScript, Tailwind CSS, Radix primitives, Lucide React, React Hook Form, Zod, TanStack Table, Zustand, Apache ECharts, ExcelJS, date-fns, Vitest, and Playwright. All core dependencies are free/open-source.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Demo data

The first visit loads Atlas Construction demo data with three projects, customers, suppliers, a subcontractor, BOQ items, purchase orders, inventory movements, expenses, progress certificates, a journal entry, and a contract document. Use **Settings → Reset Demo Data** to restore it.

## Local persistence and backup

Current prototype stores business data locally in the browser. This is intentionally temporary until the real construction company's workflows and backend requirements are fully analyzed.

- Data persists after refresh through the `LocalStorageErpRepository`.
- **Backup All Data** downloads versioned JSON.
- **Restore Backup** validates the JSON shape before replacing local data.
- No real database, backend, paid storage, or production authentication is used.

## Implemented workflow

- Companies, projects, customers, suppliers, and subcontractors: create, edit, archive, search, and persist.
- BOQ, purchase orders, inventory movements, expenses, certificates, journals, and document metadata: create, search, and persist.
- Receiving a purchase order creates a posted inventory receipt.
- Material issues enforce available-stock policy.
- Posted material issues, approved expenses, and subcontract certificates feed project cost.
- Customer certificates feed revenue and receivables.
- Balanced journal creation feeds the trial balance.
- Project cost, budget variance, profit, margin, and health update the dashboard from transaction data.
- Arabic RTL / English LTR shell, responsive drawer navigation, print styles, and Excel export.

## Prototype limitations and future migration

This is a discovery prototype, not a production accounting system. Roles, approvals, taxes, numbering, accounting mappings, and transaction workflows must be confirmed with the target contractor before final backend design. The future migration replaces repositories with API implementations and connects a production file provider, authentication, audit, and approved database schema.

## Deployment

The repository is intended for GitHub-connected Vercel deployment. No paid Vercel features, database, analytics, or add-ons are required.
