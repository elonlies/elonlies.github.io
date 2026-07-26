# Contributing evidence

This repository treats `data/` as the source of truth and the React application
as a visualizer. A data correction should not require changes under `app/`,
`components/`, or `lib/`.

## Before editing

- Keep every existing `record_id` stable.
- Cite the original statement and at least one outcome source.
- Use the current classification key instead of inventing a new score.
- Keep intent separate from an inaccurate, late, unsupported, or false outcome.
- Do not edit `generated-data/`, `public/downloads/`, `out/`, or `public/og.png`
  by hand.

## Correct evidence on an existing record

1. Edit the matching row in `data/elon_musk_claims_verified_vN.csv`.
2. If the verdict, score, inclusion, or group changed, update the affected rows
   in the summary CSV.
3. Explain the correction in the pull request. If the dataset’s versioning
   policy requires a migration note, update the matching migration row too.
4. Run `npm test`.

A source-title, source-URL, rationale, or outcome-text correction that does not
change classification usually touches only the row-level CSV.

## Add a record

1. Add one uniquely identified row to the row-level CSV.
2. Add the corresponding row to the migration CSV.
3. Update the summary CSV totals and affected group rows.
4. Add or revise classification-key or methodology content only when the rules
   themselves changed.
5. Run `npm test`.

The site will create the claim page, update counts, recompute the score, update
filters and visualizations, regenerate social metadata, and publish the current
download package automatically.

## Replace the package with a new version

1. Delete the existing five files in `data/`.
2. Add one complete package whose filenames all target the same `vN`.
3. Ensure every claim uses the matching `schema_version` and one common
   `evaluation_date`.
4. Preserve existing record IDs and include every current ID exactly once in the
   migration CSV.
5. Run:

   ```bash
   npm run lint
   npm test
   ```

The importer intentionally rejects mixed old/new packages instead of guessing
which version should be live.

## Pull request scope

Keep data PRs narrow. Include:

- what evidence or records changed
- why the prior evidence was incomplete or incorrect
- whether any verdict, score, or inclusion changed
- the commands you ran

All earlier package versions remain recoverable from Git history.
