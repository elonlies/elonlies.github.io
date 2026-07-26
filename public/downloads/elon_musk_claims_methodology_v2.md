# Elon Musk Claims Dataset v2 Methodology

Evaluation date: 2026-07-26  
Schema version: 2.0

## Headline result

The v2 Trust Score is **35.5/100**, rounded to **36/100** for homepage display, based on **83 scored claims**. Under the published rating bands, the conclusion is **Not Trustworthy**.

Recommended public wording:

> Based on the record of verifiable public statements, predictions, and promises in this tracked dataset, Elon Musk is not trustworthy.

This conclusion applies to this curated corpus. It is not a scientifically representative estimate of every statement Musk has ever made.

## What changed from v1

- Replaced the old eleven-outcome scheme with five scored verdicts: True, Mostly True, Misleading, Unsupported, and False.
- Added two visible but unscored statuses: Unresolved and Pending.
- Replaced fractional weights with a transparent 100, 75, 50, 25, 0 point scale.
- Added normalized claim types and five streamlined subject domains.
- Added a separate credible-source-contestation badge so disagreement is not mistaken for a verdict.
- Preserved every original record ID, source URL, outcome summary, and legacy verdict for auditability.
- Reclassified partial claims that are measurable instead of automatically excluding all of them.

## Score formula

Trust Score = total points earned / total possible points × 100

Point values:

- True: 100
- Mostly True: 75
- Misleading: 50
- Unsupported: 25
- False: 0
- Unresolved: excluded
- Pending: excluded

The exact v2 calculation is 2,950 points earned out of 8,300 possible points.

## Verdict definitions

### True

The central factual claim is supported, or a commitment was fulfilled materially as stated and on time.

### Mostly True

The central claim held up, but there was a limited factual error, qualification, delay, scope deviation, or evidence limitation that did not overturn the core takeaway.

### Misleading

Some material portion held up, but missing context, reduced scope, capability limits, or deadline performance substantially changed the reasonable takeaway. For promises, the display label may read Partially Fulfilled or Fulfilled Late.

### Unsupported

The claim was presented affirmatively, but adequate credible support was not available. The record did not justify a definitive False verdict. Unsupported claims receive 25 points because they did not earn full public trust, while preserving the distinction from a claim directly disproved by evidence.

### False

Reliable evidence contradicted the central factual claim, or a mature measurable commitment was unfulfilled or reversed.

### Unresolved

Evidence was genuinely insufficient or materially conflicted, or the statement lacked an objective threshold. These rows remain visible but do not alter the score.

### Pending

The relevant deadline or explicit condition had not matured by the evaluation date. These rows remain visible but do not alter the score.

## Claim types

- Factual Assertion: a testable statement about what is or was true.
- Promise or Commitment: a future action or capability substantially within Musk's or his organizations' control.
- Prediction or Forecast: a forecast about a future result, including outcomes not fully under his control.
- Opinion or Rhetoric: subjective or aspirational language. Normally excluded unless it contains a separable factual proposition.

## Primary domains

- Business & Technology
- Politics & Government
- Science & Health
- Personal & Legal
- Media & Society

The current seed corpus does not yet contain a dedicated Personal & Legal row, but the schema supports that domain for future verifiable personal-history, legal, education, citizenship, financing, donation, or public-conduct claims.

## Credible-source contestation

"Contested by credible sources" is recorded as a badge, not a score-bearing verdict. A claim can be disputed and still be true, false, misleading, unsupported, or unresolved. The contestation_resolution field records whether the available evidence favors contradiction or the dispute remains unresolved.

## Promises and predictions

The public display label adapts to the claim type while the numerical category remains consistent:

- Promise: Fulfilled, Substantially Fulfilled, Partially Fulfilled/Fulfilled Late, Unsupported, Unfulfilled/Reversed, Unresolved, Pending.
- Prediction: Correct, Mostly Correct, Mixed/Materially Late, Unsupported, Incorrect, Unresolved, Pending.

A result delivered materially late does not receive full credit merely because it eventually occurred.

## Why False is not automatically Lie

A false claim or failed prediction does not by itself prove that Musk knew the statement was false. Intent is tracked separately in deception_intent_status. The site may plainly assess demonstrated trustworthiness without claiming a proven lie unless reliable evidence establishes knowledge or intent.

## Scope and selection rules

The corpus includes consequential, concrete, publicly sourced, externally verifiable claims across business, politics, government, science, health, media, society, and potentially personal or legal matters. It excludes pure opinions, obvious jokes, vague rhetoric, private gossip, and propositions whose original wording cannot be established reliably.

A repeated identical proposition should normally remain one scored claim with repetitions documented separately. Distinct revised deadlines may remain separate because each creates a new measurable commitment.

A multi-part statement should be split into separate records whenever each component can be independently tested. TESLA-049 remains Pending in v2 because its 2025 and 2026 components were inherited as one row; it should be split during a later research expansion.

## Source hierarchy

1. Musk's original statement, company material, official government record, filing, court record, or regulator document.
2. Reuters, Associated Press, New York Times, or another major outlet documenting the statement and measurable outcome.
3. An established fact-checker with transparent sourcing and links to the original claim.
4. Secondary sources only when stronger evidence is unavailable, with confidence reduced.

Each claim row retains the original statement source and at least one outcome source.

## Selection bias

The v2 score must not be presented as the percentage of everything Musk says that is true. The corpus favors consequential and disputed claims that can be checked. The Public discourse subset is especially adverse-selected because fact-checkers investigate controversial statements rather than random everyday remarks.

The homepage can state one conclusion, but the score card should link directly to the methodology, verdict distribution, excluded claims, domain breakdown, and every source-backed row.

## Rating bands

- 80 to 100: Highly Trustworthy
- 65 to 79: Generally Trustworthy
- 45 to 64: Inconsistent
- 25 to 44: Not Trustworthy
- 0 to 24: Highly Untrustworthy

The bands are editorial judgments and must remain public.

## Update procedure

1. Preserve existing record IDs and legacy fields.
2. Add new claims as new rows rather than silently overwriting historical records.
3. Recheck Pending and Unresolved rows on a fixed cadence.
4. Update evaluation dates and outcome sources when a verdict changes.
5. Publish corrections and scoring changes in version control.
6. Require a second review for high-impact, personal, legal, medical, political, or intent-sensitive classifications.
7. Recompute the summary CSV directly from the row-level claims CSV after every change.

## Files

- elon_musk_claims_verified_v2.csv: row-level recategorized dataset
- elon_musk_claims_summary_v2.csv: computed Trust Score, verdict distribution, and group breakdowns
- elon_musk_claims_classification_key_v2.csv: machine-readable category definitions
- elon_musk_claims_migration_v1_to_v2.csv: row-by-row legacy-to-v2 classification audit
- elon_musk_claims_methodology_v2.md: scoring, scope, caveats, and update rules
