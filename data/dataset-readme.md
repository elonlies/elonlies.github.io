# Elon Musk Claims Dataset V5

Stable package filenames are used inside the ZIP so a later release can replace the data without changing website import paths.

Schema version: 5.0  
Evaluation date: 2026-07-26

## Headline

- Trust Score: **22.5%**
- Homepage score: **22%**
- Conclusion: **Highly Untrustworthy**
- Total claims: **155**
- Scored claims: **138**
- Pending or unresolved: **17**

## V5 rule change

Dated promises and forecasts are now strict pass/fail. A material deadline miss is False and scores 0, even when a related product or event appears later. Later delivery remains documented separately.

## Start here

1. `claims.csv` for website claim records.
2. `summary.csv` for headline, verdict, category, and strict-promise statistics.
3. `evaluation-audit.csv` to trace twelve evaluation outputs per claim to evidence and rules.
4. `source-audit.csv` for source quality, independence, and corroboration.
5. `migration.csv` for every V4-to-V5 change.
6. `classification-key.csv` for machine-readable rules.
7. `methodology.md` before publishing the score.

The score is a curated public-reliability measure, not a random-sample estimate of everything Musk has ever said.
