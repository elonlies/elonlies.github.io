# Elon Musk Claims Dataset v1 Methodology

Evaluation date: 2026-07-26

## What this dataset is

This is a manually researched, source-backed seed corpus of 100 concrete Elon Musk statements, business commitments, forecasts, promises and factual assertions. It spans Tesla, SpaceX, X/Twitter, Neuralink, The Boring Company and public factual claims.

It is not literally every sentence Musk has ever spoken or posted. That universe is unbounded, changes every day, includes deleted material, private remarks, jokes, opinions and statements with no testable meaning. A June 2026 New York Times project offers the broadest current independent benchmark located for this work: it reviewed more than 69,000 Musk social posts and 19 Tesla investor calls, then manually evaluated 602 concrete future-deadline business goals. Even that project excluded podcasts, media interviews and other events.

## Source hierarchy

1. Musk's original statement, company post, investor material or official government record.
2. Reuters, Associated Press, New York Times or another major outlet documenting both the statement and measurable outcome.
3. Established specialist fact-checkers such as PolitiFact when they link the original statement and provide transparent sourcing.
4. Secondary sources only when a stronger source was unavailable, with confidence reduced.

Each CSV row contains a statement-source URL and at least one outcome-source URL. Statements are paraphrased to avoid quotation errors and excessive copying; the linked source preserves the original context.

## Verdicts

- FULFILLED_ON_TIME: The promised result happened within the stated deadline.
- FULFILLED: The result happened and no explicit deadline was missed.
- FULFILLED_LATE: The result happened, but after the stated deadline.
- PARTIALLY_FULFILLED: A meaningful part happened, but material scope remained unmet or unverifiable.
- NOT_FULFILLED: A mature promise or forecast did not happen.
- PROMISE_REVERSED: Musk later did the opposite of an explicit commitment.
- FALSE / FALSE_OR_UNSUPPORTED: Reliable evidence contradicts a factual assertion or the assertion lacked the claimed support.
- PENDING: The deadline has not elapsed.
- UNCLEAR / UNSCORABLE: Public evidence is inadequate, conditions are unresolved or the statement is too vague for an objective verdict.

## Scores

binary_resolved_score:
- 1 for accurate factual claims or eventually fulfilled commitments.
- 0 for false factual claims, reversed promises or commitments that were not fulfilled.
- Blank for partial, pending, unclear or unscorable rows.

on_time_score:
- 1 when an explicit deadline was met.
- 0 when it was missed.
- Blank when no objective deadline applies.

weighted_reliability_score:
- 1.0 for accurate or fully fulfilled/on-time results.
- 0.75 for slight lateness or strong partial delivery.
- 0.5 for substantial lateness or material partial delivery.
- 0.25 for weak partial delivery.
- 0.0 for false, reversed or unfulfilled claims.

These weights are editorial judgments. Your site should display the rule and let users recompute with alternative weights.

## Why the site should not simply label rows “truth” and “lie”

A lie requires knowing the speaker believed the statement was false or intended to deceive. Public evidence often establishes only that a claim was wrong or a forecast failed. Therefore the CSV has a separate deception_intent_status field. Unless a court or equivalent authoritative finding establishes intent, the safer label is inaccurate, unsupported, missed, late or reversed.

The 2018 “funding secured” row illustrates this distinction. The SEC alleged fraud and Musk settled without admitting or denying wrongdoing; a later investor jury found him not liable. The dataset scores the financing assertion as unsupported while expressly avoiding a claim that deceptive intent was conclusively proven.

## Selection bias and percentage use

No percentage from this v1 corpus should be presented as “the percentage of everything Elon Musk says that is true.” The corpus deliberately favors consequential, concrete and verifiable claims. The PolitiFact speaker profile is even more selected: fact-checkers choose disputed claims, so its 10 negative factual ratings cannot represent ordinary statements.

Recommended site labels:
- Factual-claim accuracy within this verified corpus
- Promise eventual-fulfillment rate within this verified corpus
- Dated-promise on-time rate within this verified corpus
- Weighted reliability score within this verified corpus

Do not use “honesty percentage” without displaying these limitations next to the number.

## External completeness benchmark

New York Times audit:
https://www.nytimes.com/interactive/2026/06/02/technology/elon-musk-promises-spacex-ipo.html
Archive:
https://archive.is/c2u4U

Published aggregate findings:
- 19 percent achieved on time
- 35 percent late or unfulfilled
- 33 percent unclear or lacking a public update
- 13 percent with future deadlines

Because the Times did not publish a downloadable row-level dataset in the materials reviewed here, those 602 entries are not silently represented as if independently reproduced in this CSV.

## Update procedure

1. Preserve every existing record_id.
2. Add new claims as new rows; never overwrite historical statement wording or deadlines.
3. Recheck pending and unclear rows on a fixed cadence.
4. Keep the evaluation_date and outcome sources current.
5. Record corrections in version control and publish a changelog.
6. Deduplicate repeated statements only when they are genuinely identical; repeated deadlines can be independent promises and may remain separate rows.
7. Require one researcher to score and another to review high-impact or legally sensitive rows.

## Files

- elon_musk_claims_verified_v1.csv: row-level dataset
- elon_musk_claims_summary_v1.csv: computed metrics, domain breakdowns and external benchmarks
- elon_musk_claims_methodology_v1.md: definitions, caveats and update rules
