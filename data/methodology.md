# Elon Musk Claims Dataset v5 Methodology

Evaluation date: 2026-07-26  
Schema version: 5.0  
Evidence audit schema: strict-promise-evidence-audit-v2.0

## Headline result

V5 contains **155 records**, with **138 resolved claims** included in the Trust Score. The exact Trust Score is **22.5%** (3,100 of 13,800 possible points), rounded to **22%** for homepage display. Under the published rating bands, the conclusion is **Highly Untrustworthy**.

Recommended public wording:

> Based on the record of material, verifiable public statements, forecasts, and commitments in this tracked dataset, Elon Musk is highly untrustworthy.

This is a curated reliability audit. It is not a statistically representative estimate of every statement Musk has ever made.

## The V5 correction: strict promises mean strict deadlines

V4 awarded partial credit to promises that were delivered late or only partially. V5 removes that ambiguity.

For every Promise or Commitment and Prediction or Forecast:

- **True, 100 points** only when every material term was met, including timing, scope, quantity, capability, price, and permanence.
- **False, 0 points** when any matured material term failed.
- **Pending, excluded** when the deadline or condition has not matured.
- **Unresolved, excluded** when the evidence cannot responsibly establish pass or fail.

A later delivery is recorded in `eventual_outcome` and `later_delivery_note`, but it cannot satisfy the original proposition. Put plainly: **2012 is not 2010**. A result hours late, eight days late, or years late is False when the original statement promised a specific deadline.

The rule is intentionally strict because this project measures whether a public commitment was reliable as stated, not whether something vaguely similar happened eventually.

## Factual-claim categories

Factual assertions retain the streamlined evidence categories:

- True: 100
- Mostly True: 75
- Misleading: 50
- Unsupported: 25
- False: 0
- Unresolved: excluded

Mostly True, Misleading, and Unsupported are no longer available to promises or forecasts.

## V5 research additions

V5 adds records involving:

- Apple App Store removal claims and Musk's later correction
- The promise that stolen-election falsehoods on X would be corrected
- X's Q2 2023 cash-flow prediction
- Tesla's August 8 robotaxi unveiling deadline
- A May 2021 FSD-subscription commitment
- A favorable FSD Beta rollout prediction that was actually met
- Separate 2025 and 2026 Optimus propositions
- DOGE's $1 trillion spending-cut target
- Michigan voter-roll claims
- Musk's SNL host-history claim
- The Springfield Haitian pet-eating narrative
- Separate narrow and broad emerald-operation propositions

Favorable, unfavorable, and unresolved rows are all retained when they meet the same inclusion rule.

## Trust Score formula

Trust Score = total points earned / total possible points × 100

Pending and Unresolved rows remain visible but are excluded from the denominator.

## All evaluation outputs are evidence-derived

Each claim includes evidence bases for:

1. deadline result
2. eventual outcome
3. factual accuracy
4. canonical verdict
5. score points
6. score inclusion
7. confidence
8. credible-source contestation
9. correction status
10. repetition after correction
11. intentional-deception answer
12. strict promise result

The field-level `evaluation-audit.csv` contains exactly one row for each of these twelve outputs for every claim.

## Evidence metrics

- Statement evidence quality: 0 to 30
- Outcome evidence quality: 0 to 40
- Independent corroboration: 0 to 15
- Directness: 0 to 15
- Evidence strength: sum of the four components, maximum 100
- Verdict confidence: evidence strength after published deductions for nuance, contestation, unresolved conflict, weak independence, or party-only outcome evidence

These scores describe the structure of the cited evidence. They are not probabilities and should not be marketed as scientific certainty.

## Intentional deception

Accuracy, fulfillment, and intent remain separate. A False result does not automatically establish a lie.

`intentional_deception_established` uses:

- Yes
- No
- Not assessable

A Yes requires a direct admission, an adjudicated finding that actually addresses intent, or comparably conclusive contemporaneous state-of-mind evidence. Pending and Unresolved rows receive Not assessable.

## Accuracy and uncertainty

No responsible dataset can promise literal 100% error-free historical adjudication. V5 instead guarantees a reproducible rule: every status must be supported by cited evidence, every derived statistic must expose its basis and calculation, and genuine uncertainty must be marked Unresolved rather than forced into a favorable or unfavorable box.

## Source hierarchy

1. Direct Musk statements, official records, filings, court records, agency data, and authenticated correspondence.
2. Reuters, Associated Press, major national publications, and equivalent established outlets.
3. Transparent specialist fact-checkers and domain publications that reproduce the original statement.
4. Secondary sources only when stronger evidence is unavailable, with confidence reduced.

Company sources are treated as party evidence, not neutral adjudication.

## Reposts and compound statements

A bare repost is not automatically scored as Musk adopting every sentence. A repost can be scored when he adds affirmative commentary, explicitly endorses the proposition, or uses it as evidence for his own conclusion.

Compound statements are split when they contain separable deadlines, capabilities, quantities, or factual premises. V5 splits the 2025 internal-use and 2026 external-production Optimus targets, and splits the narrow emerald-mine ownership denial from the broader denial that an emerald operation existed.

## Selection bias

The corpus prioritizes consequential, disputed, and externally verifiable claims. Fact-check archives and investigative reporting are not random samples of ordinary speech. The score must never be presented as the percentage of everything Musk says that is true.

## Rating bands

- 80 to 100: Highly Trustworthy
- 65 to 79.9: Generally Trustworthy
- 45 to 64.9: Inconsistent
- 25 to 44.9: Not Trustworthy
- 0 to 24.9: Highly Untrustworthy

These thresholds are editorial judgments and remain public.

## Update procedure

1. Preserve stable record IDs and publish a migration log.
2. Store one objectively testable proposition per row.
3. Cite the statement and outcome evidence.
4. Apply strict pass/fail to matured promises and forecasts.
5. Keep later delivery separate from the original verdict.
6. Populate every evidence-basis field.
7. Calculate evidence metrics from the published rubric.
8. Keep intent separate and use the strict state-of-mind standard.
9. Recheck Pending and Unresolved rows on a fixed cadence.
10. Publish corrections and score changes instead of silently overwriting history.
11. Require human review before publishing sensitive personal, legal, medical, political, or intent-sensitive verdicts.
