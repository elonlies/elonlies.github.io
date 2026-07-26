## What changed

Describe the evidence, record, or package update.

## Data checklist

- [ ] Existing `record_id` values remain stable.
- [ ] Every new or corrected claim has a statement source and primary outcome source.
- [ ] Every new or corrected record has one universal `primary_domain` subject category.
- [ ] `public_discourse_category` is used only as an optional public-discourse subcategory.
- [ ] `related_entity` is treated as independent organization/entity context.
- [ ] `organization_or_domain` is preserved for legacy/audit compatibility, not used as the visitor-facing taxonomy.
- [ ] Verdict, points, and inclusion match a Primary verdict in the classification key.
- [ ] Summary and migration rows were updated when required.
- [ ] `data/` contains exactly `claims.csv`, `summary.csv`, `classification-key.csv`, `migration.csv`, and `methodology.md`.
- [ ] `schema_version`, `evaluation_date`, migration metadata, and methodology metadata agree.
- [ ] I did not hand-edit generated data, downloads, build output, or score copy.
- [ ] `npm run lint` passes.
- [ ] `npm test` passes.

## Classification impact

Note any verdict, score, inclusion, or denominator changes. Write “None” when
the pull request only corrects evidence or explanatory text.
