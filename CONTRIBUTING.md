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
- Use `public_discourse_category` only as an optional subcategory for
  public-discourse records; leave it blank when it does not apply.
- Treat `related_entity` as independent organization/entity context, not as a
  replacement for the subject category.
- Preserve `organization_or_domain` for legacy and audit compatibility. Do not
  use it to define new visitor-facing subject categories.
- Do not edit `generated-data/`, `public/downloads/`, `out/`, or `public/og.png`
  by hand.

## Correct evidence on an existing record

1. Edit the matching row in `data/claims.csv`.
2. If the verdict, score, inclusion, subject category, or summarized grouping
   changed, update the affected rows in `data/summary.csv`.
3. Explain the correction in the pull request. If the dataset’s versioning
   policy requires a migration note, update the matching row in
   `data/migration.csv` too.
4. Run `npm test`.

A source-title, source-URL, rationale, or outcome-text correction that does not
change classification usually touches only the row-level CSV.

## Add a record

1. Add one uniquely identified row to the row-level CSV.
2. Set its universal `primary_domain`, add `related_entity` context when
   applicable, and use `public_discourse_category` only for a relevant
   public-discourse subcategory.
3. Populate `organization_or_domain` consistently for legacy/audit
   compatibility, without treating it as the visitor-facing taxonomy.
4. Add the corresponding row to the migration CSV.
5. Update the summary CSV totals and affected subject-category or other group
   rows.
6. Add or revise classification-key or methodology content only when the rules
   themselves changed.
7. Run `npm test`.

The site will create the claim page, update counts, recompute the score, update
filters and visualizations, regenerate social metadata, and publish the current
download package automatically.

## Replace the package with a new version

1. Keep the five stable filenames in `data/` and replace their contents.
2. Set the new `schema_version` and one common `evaluation_date` on every row in
   `data/claims.csv`.
3. Set `new_schema_version` to that same version on every row in
   `data/migration.csv`; existing records should identify one prior
   `old_schema_version`, while genuinely new records may leave it blank.
4. Update the version and evaluation date near the top of
   `data/methodology.md`.
5. Preserve existing record IDs and include every current ID exactly once in
   `data/migration.csv`.
6. Preserve the taxonomy contract: one `primary_domain` per row, optional
   public-discourse subcategories, independent `related_entity` context, and
   `organization_or_domain` only for legacy/audit compatibility.
7. Reconcile `data/summary.csv` and update `data/classification-key.csv` only
   when the scoring rules changed.
8. Run:

   ```bash
   npm run lint
   npm test
   ```

The importer intentionally rejects renamed, mixed-version, or partially updated
packages instead of guessing which data should be live.

## Pull request scope

Keep data PRs narrow. Include:

- what evidence or records changed
- why the prior evidence was incomplete or incorrect
- whether any verdict, score, or inclusion changed
- whether any subject category, public-discourse subcategory, or related entity
  changed
- the commands you ran

All earlier package versions remain recoverable from Git history.
