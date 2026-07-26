## What changed

Describe the evidence, record, or package update.

## Data checklist

- [ ] Existing `record_id` values remain stable.
- [ ] Every new or corrected claim has a statement source and primary outcome source.
- [ ] Every new or corrected record has one universal `primary_domain` subject category.
- [ ] `public_discourse_category` is an optional cross-cutting Topic category, not restricted to an organization or `Public discourse` context.
- [ ] `organization_or_domain` is treated as secondary organization or situational context.
- [ ] `relationship_to_organization` is set when that context relationship needs explanation.
- [ ] Verdict, points, and inclusion match a verdict in the classification key.
- [ ] Source-audit and field-level evaluation-audit rows were added or updated when required.
- [ ] Summary and source-provided migration rows were updated when required.
- [ ] `data/` contains exactly `claims.csv`, `summary.csv`, `evaluation-audit.csv`, `source-audit.csv`, `classification-key.csv`, `migration.csv`, `methodology.md`, and `dataset-readme.md`.
- [ ] Version and evaluation-date metadata inside the package files agree; no version is encoded in a filename.
- [ ] I treated migration lineage as the source package’s baseline and used Git history for the literal repository diff.
- [ ] I did not hand-edit generated data, downloads, build output, or score copy.
- [ ] `npm run lint` passes.
- [ ] `npm test` passes.

## Classification impact

Note any verdict, score, inclusion, or denominator changes. Write “None” when
the pull request only corrects evidence or explanatory text.
