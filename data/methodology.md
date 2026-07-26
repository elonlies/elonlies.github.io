# Elon Musk Claims Dataset v4 Methodology

Evaluation date: 2026-07-26
Schema version: 4.0
Evidence audit schema: evidence-audit-v1.0

## Headline result

The V4 Trust Score is **34.3%**, rounded to **34%** for homepage display, based on **123 scored claims** out of **143 total records**. Under the published bands, the conclusion is **Not Trustworthy**.

Recommended public wording:

> Based on the record of material, verifiable public statements, predictions, and promises in this tracked dataset, Elon Musk is not trustworthy.

This is a curated reliability audit. It is not a statistically representative measurement of every statement Musk has ever made.

## What changed from v3

- Expanded the corpus from 130 to **143 records**.
- Added three X / Twitter commitments, including the Alex Jones reinstatement reversal, child-safety priority claim, and promised removal of blocking.
- Added nine Public discourse and personal-history records involving antisemitism, South African “white genocide” claims, UK political accusations, DOGE spending claims, education history, and a credibly contested account of Musk’s first child’s death.
- Added one Tesla founder-title record.
- Reclassified `ZIP2-001` from Unresolved to False because the V4 proposition is Musk’s blanket denial and the cited documentary record establishes unauthorized work during part of the relevant period.
- Added an explicit answer to **“Was intentional deception established?”** for every record.
- Added field-level evidence bases and deterministic evidence metrics for every evaluation output.
- Replaced unreviewed migration placeholders with evidence-bounded wording.

## Current results

- Overall: **34.3%**, Not Trustworthy, n=123 scored.
- Public discourse: **23.6%**, Highly Untrustworthy, n=36 scored and 38 total.
- X / Twitter: **40.9%**, Not Trustworthy, n=11 scored and 14 total.
- Intentional deception established: **0 Yes**, **123 No**, and **20 Not assessable** because Pending and Unresolved rows are not suitable for a state-of-mind conclusion.

## Trust Score formula

Trust Score = total points earned / total possible points × 100

- True: 100
- Mostly True: 75
- Misleading: 50
- Unsupported: 25
- False: 0
- Unresolved: excluded
- Pending: excluded

V4 earns **4,225 points out of 12,300 possible points**. The point total is calculated directly from the evidence-based row verdicts.

## Verdict definitions

### True
The central factual claim is supported, or a commitment was fulfilled materially as stated and on time.

### Mostly True
The central claim held up with a meaningful but nonfatal qualification, limited factual error, delay, or omission.

### Misleading
Some material portion held up, but context, framing, scope, capability, or timing substantially changed the reasonable takeaway.

### Unsupported
The affirmative claim lacks adequate credible support, but the evidence does not justify a definitive False verdict.

### False
Reliable evidence contradicts the central claim, or a mature measurable commitment was unfulfilled or reversed.

### Unresolved
Evidence is genuinely insufficient or materially conflicted. These rows remain visible but do not alter the score.

### Pending
The deadline or explicit condition has not matured by the evaluation date. These rows remain visible but do not alter the score.

## All evaluation statistics are evidence-derived

Each main-CSV row contains evidence bases for:

- deadline result
- eventual outcome
- factual accuracy
- canonical verdict
- score points
- score inclusion
- credible-source contestation
- correction status
- repetition after correction
- confidence
- intentional-deception answer

The `evaluation-audit.csv` file expands those eleven outputs into **1,573 audit rows**. Each audit row includes the metric value, evidence basis, evidence URLs, calculation rule, evidence-strength score, and confidence score.

## Evidence metrics

The evidence metrics are deterministic and transparent:

- Statement evidence quality: 0 to 30
- Outcome evidence quality: 0 to 40
- Corroboration: 0 to 15
- Directness: 0 to 15
- Evidence strength: sum of the four components, maximum 100
- Verdict confidence: evidence strength after published deductions

Deductions apply to nuanced verdicts, unresolved conflicts, party-only outcome evidence, and material contestation. Confidence bands are High, Medium-High, Medium, Medium-Low, and Low. These metrics measure the structure of the cited evidence. They do not replace the substantive row-level analysis.

## Intentional deception

Accuracy and intent remain separate. `intentional_deception_established` uses only three public answers:

- Yes
- No
- Not assessable

The more detailed `deception_intent_status` uses:

- Established
- Suggested but not established
- Not established
- Not assessable

A Yes requires a direct admission, an adjudicated finding that actually addresses intent, or comparably strong contemporaneous state-of-mind evidence. A false claim, failed prediction, missed deadline, misleading statement, or unsupported accusation does **not** automatically establish a lie.

V4 has no rows marked Established. Five rows are marked Suggested but not established because the cited record contains meaningful evidence of contrary internal or prior knowledge.

## Race, xenophobia, antisemitism, and other sensitive topics

The dataset records descriptive `sensitive_topic_tags` for subjects such as race, religion, immigration, antisemitism, child safety, and anti-Muslim politics. Those tags do not mechanically change the verdict or score.

The site should avoid presenting an editorial label such as “racist” as though it were a fact-check verdict. Instead, it should show the exact proposition, the evidence, the verdict, and the relevant topic tags.

## Personal-life claims

Personal claims are included only when Musk made or authorized a public, material, objectively testable representation and strong evidence exists. Private gossip is excluded.

The first-child claim is Unresolved because two direct first-hand accounts conflict and the public evidence reviewed does not independently resolve the precise circumstances. Excluding it from the score is more defensible than forcing a favorable or unfavorable result.

## Corrections, deletion, and repetition

Correction and repetition fields are bounded to the cited evidence. “No correction documented” does not mean that no correction exists anywhere. Repetition counts are minimum documented counts, not exhaustive social-media counts.

A correction does not erase the original claim. Repetition does not create duplicate scored rows unless Musk makes a materially distinct proposition or deadline.

## Source hierarchy

1. Direct Musk statements, official records, filings, court records, agency data, and authenticated correspondence.
2. Reuters, Associated Press, The Washington Post, The New York Times, and other established outlets.
3. Established fact-checkers with transparent sourcing.
4. Secondary sources only when stronger evidence is unavailable, with confidence reduced.

A company or organization involved in a dispute is treated as a party source rather than neutral adjudication. Party-only outcome evidence receives an explicit confidence deduction.

## Selection bias

The corpus intentionally prioritizes consequential, disputed, and externally verifiable claims. Fact-check archives and news investigations are not random samples of ordinary speech, so the Trust Score must never be described as the percentage of everything Musk says that is true.

The headline score must link to the claim list, excluded rows, evidence audit, source audit, methodology, and version history.

## Rating bands

- 80 to 100: Highly Trustworthy
- 65 to 79.9: Generally Trustworthy
- 45 to 64.9: Inconsistent
- 25 to 44.9: Not Trustworthy
- 0 to 24.9: Highly Untrustworthy

These thresholds are editorial judgments and must remain public.

## Update procedure

1. Preserve record IDs and publish migration changes.
2. Add one objectively testable proposition per row.
3. Cite the original statement and at least one outcome source.
4. Populate every evaluation basis field.
5. Calculate evidence metrics from the published rubric.
6. Apply the verdict-to-points mapping mechanically.
7. Keep intent separate and require the strict state-of-mind standard.
8. Recheck Pending and Unresolved rows on a fixed cadence.
9. Publish corrections and score changes rather than silently replacing history.
10. Require a second human review before publishing high-impact personal, legal, medical, political, or intent-sensitive verdicts.

## V4 files

- `claims.csv`: complete 143-row claims corpus.
- `summary.csv`: recalculated Trust Score and category breakdowns.
- `source-audit.csv`: source-quality and corroboration audit.
- `evaluation-audit.csv`: field-level evidence audit for eleven evaluation outputs per claim.
- `migration.csv`: source-provided row-level migration and change log.
- `classification-key.csv`: machine-readable verdict, intent, confidence, and scoring rules.
- `methodology.md`: methodology and caveats.
- `dataset-readme.md`: bundle guide.
