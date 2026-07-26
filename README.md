# Elon Musk Trust Score

A modern, evidence-led website for a 100-record corpus of Elon Musk’s public
claims, promises, forecasts, and outcomes.

The project presents one provisional headline score—**36%, Not
Trustworthy** (35.5 before rounding)—while keeping the calculation, every
excluded record, every verdict, and every citation open to inspection. It does
not label every failed claim a lie or claim that the corpus represents
everything Musk has ever said.

## What is included

- A direct homepage conclusion with visible scope and caveats
- Full score calculation plus domain and organization breakdowns
- Outcome distribution across all 100 records
- Annual Trust Score and False-share trend lines with sample-size details
- Raw yearly False counts, overall verdict composition, and claim-type comparisons
- Interactive alternative-weight calculator
- Searchable, filterable evidence index with shareable query parameters
- A dedicated detail page for every record
- Source links, scoring notes, confidence, credible-source contestation, and
  deception-intent status
- Methodology, selection-bias disclosure, correction policy, and downloads
- A row-by-row v1-to-v2 migration audit with stable record IDs
- Responsive, keyboard-accessible, print-friendly presentation

## Requirements

- Node.js 22.13 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validate a production build

```bash
npm test
```

This regenerates the JSON data from the checked-in CSV sources, creates the
static GitHub Pages export, then verifies the homepage, score page, all 100 claim
routes, visualization page, public downloads, social metadata, and core dataset
invariants.

## Data workflow

The authoritative v2 project copies live in `data/`:

- `elon_musk_claims_verified_v2.csv`
- `elon_musk_claims_summary_v2.csv`
- `elon_musk_claims_classification_key_v2.csv`
- `elon_musk_claims_migration_v1_to_v2.csv`
- `elon_musk_claims_methodology_v2.md`

The original v1 source package remains in `source-data/` for historical
auditability.

Run this after changing any v2 source file:

```bash
npm run data:build
```

The importer is BOM-aware, handles quoted CSV fields, verifies 100 unique record
IDs, reconciles every row to the seven-category classification key and migration
map, requires a statement source plus a primary outcome source, and verifies the
published 2,950-of-8,300-point score. It writes the generated JSON application
data alongside the authoritative CSVs in `data/`.

The importer also keeps matching visitor downloads under `public/downloads/`
in sync. When updating the corpus, change the v2 files in `data/`, preserve all
existing record IDs, rerun the importer, and document corrections in version
control.

## GitHub Pages deployment

The app uses React, TypeScript, and Next.js static export. It does not require a
server at runtime.

```bash
npm run build
```

The deployable site is written to `out/`. To preview that exact output locally:

```bash
npm start
```

The workflow at `.github/workflows/deploy-pages.yml` builds and publishes `out/`
whenever `main` is pushed.

One repository setting is required:

1. Open **Settings → Pages** on GitHub.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push `main`, or run **Deploy GitHub Pages** manually from the Actions tab.

If the public URL displays this README, Pages is still using the legacy
“Deploy from a branch” source instead of the GitHub Actions workflow.

## Editorial note

“Not trustworthy” is the disclosed conclusion of an editorial scoring model
applied to this tracked corpus. A wrong prediction, broken promise, or
unsupported assertion does not by itself prove deliberate deception. The
project is independent and unaffiliated with Elon Musk or any of his companies.
