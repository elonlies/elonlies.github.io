# Elon Musk Trust Score

A modern, evidence-led visualizer for a citation-backed corpus of Elon Musk’s
public claims, promises, forecasts, and outcomes.

The application does not maintain a second copy of the score in React. Record
counts, score math, verdicts, groupings, trend windows, citations, downloads,
social metadata, and claim routes are generated from the current data package
at build time.

## What is included

- A percentage Trust Score with its exact points fraction on hover
- Full score calculation plus subject-category breakdowns and an independent
  organization/context facet
- Outcome distribution and annual trend visualizations
- Raw yearly zero-point counts with sample-size details
- Interactive alternative-weight calculator
- Searchable, filterable evidence index with shareable query parameters
- A dedicated detail page and source chain for every record
- Current classification rules, rating bands, methodology, and downloads
- Responsive, keyboard-accessible, print-friendly presentation
- Restrained, progressive motion with a complete reduced-motion fallback

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

- `claims.csv`
- `summary.csv`
- `evaluation-audit.csv`
- `source-audit.csv`
- `classification-key.csv`
- `migration.csv`
- `methodology.md`
- `dataset-readme.md`

These filenames stay stable between releases. Version and evaluation-date
metadata live inside the package files, so updating the dataset does not
require renaming files or changing imports. The importer cross-checks that
metadata and does not contain a hardcoded current version, record count, score,
verdict list, or category list.

The row-level claims CSV drives everything displayed by the site. The summary
CSV is reconciled against those rows, the classification key defines score
categories and weights, the evaluation audit traces calculated fields to their
evidence and rules, and the source audit records evidence-quality checks. The
migration CSV must cover every current record ID exactly once. The methodology
and dataset README document the package in human-readable form. Generated JSON
lives in ignored `generated-data/`; synchronized visitor downloads live in
ignored `public/downloads/`. Git history is the archive for older packages.

The visitor-facing taxonomy separates subject, topic, and context:

- `primary_domain` is the universal subject category. Every record has one, and
  it drives the site’s primary category filters, comparisons, and breakdowns.
- `public_discourse_category` is an optional, cross-cutting **Topic category**.
  It can describe a relevant public topic regardless of whether the claim is
  about a company, an organization, or neither. It does not replace
  `primary_domain`.
- `organization_or_domain` is secondary organization or situational context.
  It can help visitors narrow the evidence without defining the claim’s subject
  category.
- `relationship_to_organization` explains how the speaker or claim relates to
  that context when applicable.

Run the importer directly when working on data:

```bash
npm run data:build
```

It validates:

- the eight stable source filenames
- one content-defined schema version and evaluation date
- CSV shape, required columns, and unique stable record IDs
- statement and primary-outcome citations for every claim
- score and inclusion consistency with each verdict rule
- exact score, verdict counts, and all published group summaries
- source-audit coverage and evidence-component arithmetic
- complete field-level evaluation-audit coverage and agreement with claim rows
- one source-provided migration row per current claim with valid lineage status
- methodology and package metadata

## Contributing evidence

Data-only pull requests should not edit React code, generated JSON, public
downloads, or score copy. See [CONTRIBUTING.md](CONTRIBUTING.md) for the short
correction, new-record, and full-version workflows.

For a full dataset update, replace the contents of those same eight files,
update the version and evaluation date inside the data, and run `npm test`. If
the package is internally consistent, the entire site updates without
source-code or filename changes.

`migration.csv` is source-provided lineage for the package being imported. Its
“prior version” describes the source package’s own baseline; it should not be
presented as a guaranteed row-for-row diff against whatever package happened
to be committed immediately before it in this repository. Use Git history for
the literal repository diff.

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
