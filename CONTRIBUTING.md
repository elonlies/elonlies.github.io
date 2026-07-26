# Contributing evidence

This repository treats `data/` as the source of truth and the React application
as a visualizer. A data correction should not require changes under `app/`,
`components/`, or `lib/`.

## Before editing

- Keep every existing `record_id` stable.
- Cite the original statement and at least one outcome source.
- Use the current classification key instead of inventing a new score.
- Keep intent separate from an inaccurate, late, unsupported, or false outcome.
- Give every record one `primary_domain`. This is the universal,
  visitor-facing subject category.
- Use `public_discourse_category` as an optional, cross-cutting **Topic
  category**. It may apply to claims about any subject and is not restricted to
  a company, organization, or `Public discourse` context.
- Treat `organization_or_domain` as secondary organization or situational
  context, not as a replacement for the subject category.
- Use `relationship_to_organization` to describe the claim’s relationship to
  that context when applicable.
- Do not edit `generated-data/`, `public/downloads/`, `out/`, or `public/og.png`
  by hand.

## Correct evidence on an existing record

1. Edit the matching row in `data/claims.csv`.
2. Update the matching `data/source-audit.csv` row when source selection,
   evidence quality, corroboration, directness, or confidence changed.
3. Update the affected rows in `data/evaluation-audit.csv` whenever an audited
   evaluation value, basis, source set, calculation rule, or confidence value
   changed.
4. If the verdict, score, inclusion, subject category, Topic category, context,
   or summarized grouping changed, update the affected rows in
   `data/summary.csv`.
5. Explain the correction in the pull request. If the dataset’s versioning
   policy requires a migration note, update the matching row in
   `data/migration.csv` too.
6. Run `npm test`.

Even when a correction does not change the verdict, keep the row-level claim,
source audit, and affected field-level audit records synchronized.

## Add a record

1. Add one uniquely identified row to the row-level CSV.
2. Set its universal `primary_domain`, add `organization_or_domain` context
   when applicable, and use `public_discourse_category` for any relevant
   cross-cutting Topic category.
3. Set `relationship_to_organization` when the organization/context
   relationship needs explanation.
4. Add the corresponding source-audit row and the required field-level
   evaluation-audit rows.
5. Add the corresponding row to the migration CSV.
6. Update the summary CSV totals and affected subject, topic, context, or other
   group rows.
7. Add or revise classification-key or methodology content only when the rules
   themselves changed.
8. Run `npm test`.

The site will create the claim page, update counts, recompute the score, update
filters and visualizations, regenerate social metadata, and publish the current
download package automatically.

## Replace the package with a new version

1. Keep these eight stable filenames in `data/` and replace their contents:

   - `claims.csv`
   - `summary.csv`
   - `evaluation-audit.csv`
   - `source-audit.csv`
   - `classification-key.csv`
   - `migration.csv`
   - `methodology.md`
   - `dataset-readme.md`

2. Set the new `schema_version` and one common `evaluation_date` on every row in
   `data/claims.csv`.
3. Update version and evaluation-date metadata inside the applicable package
   files, including `data/methodology.md` and `data/dataset-readme.md`. Do not
   encode the version in any filename.
4. Ensure the audit files use the same current record IDs and reflect the
   current claim-row values, evidence, and confidence calculations.
5. Preserve existing record IDs and include every current ID exactly once in
   `data/migration.csv`.
6. Preserve the taxonomy contract: one `primary_domain` per row, optional
   cross-cutting Topic categories, secondary `organization_or_domain` context,
   and an applicable `relationship_to_organization`.
7. Reconcile `data/summary.csv` and update `data/classification-key.csv` only
   when the scoring rules changed.
8. Run:

   ```bash
   npm run lint
   npm test
   ```

The importer intentionally rejects renamed, mixed-version, or partially updated
packages instead of guessing which data should be live.

The migration file is lineage supplied with the incoming dataset. Its prior
version refers to that source package’s own baseline and may not be a literal
row-for-row diff against the repository’s immediately preceding commit. Do not
rewrite source-provided lineage to force that interpretation; use Git history
when reviewing the actual repository diff.

## Pull request scope

Keep data PRs narrow. Include:

- what evidence or records changed
- why the prior evidence was incomplete or incorrect
- whether any verdict, score, or inclusion changed
- whether any subject category, Topic category, organization/context, or
  relationship changed
- the commands you ran

All earlier package versions remain recoverable from Git history.
