# Elon Musk Trust Score

A modern, evidence-led visualizer for a citation-backed corpus of Elon Musk’s
public claims, promises, forecasts, and outcomes.

The application does not maintain a second copy of the score in React. Record
counts, score math, verdicts, groupings, trend windows, citations, downloads,
social metadata, and claim routes are generated from the current data package
at build time.

## What is included

- A percentage Trust Score with its exact points fraction on hover
- Full score calculation plus domain and organization breakdowns
- Outcome distribution and annual trend visualizations
- Raw yearly zero-point counts with sample-size details
- Interactive alternative-weight calculator
- Searchable, filterable evidence index with shareable query parameters
- A dedicated detail page and source chain for every record
- Current classification rules, rating bands, methodology, and downloads
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
npm run lint
npm test
```

`npm test` validates the package, regenerates application data and public
downloads, creates the static GitHub Pages export, and verifies every generated
claim route plus the dataset invariants.

## Data architecture

`data/` is the only authoritative data directory. It must contain exactly one
complete, current package:

- `elon_musk_claims_verified_vN.csv`
- `elon_musk_claims_summary_vN.csv`
- `elon_musk_claims_classification_key_vN.csv`
- `elon_musk_claims_migration_vPREVIOUS_to_vN.csv`
- `elon_musk_claims_methodology_vN.md`

The importer discovers `vN` from the filenames and checks it against the
row-level `schema_version`. It does not contain a current-version filename,
record count, score, verdict list, or category list.

The row-level claims CSV drives everything displayed by the site. The summary
CSV is reconciled against those rows, the classification key defines score
categories and weights, and the migration CSV must cover every current record
ID exactly once. Generated JSON lives in ignored `generated-data/`; synchronized
visitor downloads live in ignored `public/downloads/`. Git history is the
archive for older packages.

Run the importer directly when working on data:

```bash
npm run data:build
```

It validates:

- one complete package and one target version
- CSV shape, required columns, and unique stable record IDs
- statement and primary-outcome citations for every claim
- score and inclusion consistency with each Primary verdict rule
- exact score, verdict counts, and all published group summaries
- one migration row per current claim
- methodology version and evaluation-date metadata

## Contributing evidence

Data-only pull requests should not edit React code, generated JSON, public
downloads, or score copy. See [CONTRIBUTING.md](CONTRIBUTING.md) for the short
correction, new-record, and full-version workflows.

For a full dataset update, remove the current five files from `data/`, add the
new five-file package with matching target versions, and run `npm test`. If the
package is internally consistent, the entire site updates without source-code
changes.

## GitHub Pages deployment

The app uses React, TypeScript, and Next.js static export. It does not require a
server at runtime.

```bash
npm run build
```

The deployable site is written to `out/`. Preview that exact output locally with:

```bash
npm start
```

The workflow at `.github/workflows/deploy-pages.yml` validates pull requests and
publishes `out/` whenever `main` is pushed.

One repository setting is required:

1. Open **Settings → Pages** on GitHub.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push `main`, or run **Deploy GitHub Pages** manually from the Actions tab.

If the public URL displays this README, Pages is still using the legacy
“Deploy from a branch” source instead of the GitHub Actions workflow.

## Editorial note

The displayed conclusion is the disclosed result of an editorial scoring model
applied to the tracked corpus. A wrong prediction, broken promise, or
unsupported assertion does not by itself prove deliberate deception. The
project is independent and unaffiliated with Elon Musk or any of his companies.
