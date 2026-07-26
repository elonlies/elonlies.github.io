# Elon Musk Trust Score Methodology v3

**Dataset version:** 3.0  
**Evaluation date:** 2026-07-26  
**Total records:** 131  
**Scored records:** 111  
**Unresolved or pending records:** 20  
**Exact Trust Score:** 37.6/100  
**Homepage display:** 38/100  
**Conclusion:** Not Trustworthy

## Purpose

This dataset evaluates the demonstrated reliability of material, objectively verifiable public statements, promises, predictions, and representations associated with Elon Musk. It includes company commitments, politics, elections, public spending, science and health, media claims, personal-history claims, accusations about individuals, and statements about former organizations such as OpenAI, PayPal/X.com, and Zip2.

The score is not the percentage of every sentence Musk has ever spoken that was true. The corpus is curated, source-backed, and weighted toward consequential or disputed claims that can be externally evaluated.

## Singular Trust Score

Each resolved claim receives one primary verdict and a fixed point value:

| Verdict | Points | Included |
|---|---:|---|
| True | 100 | Yes |
| Mostly True | 75 | Yes |
| Misleading | 50 | Yes |
| Unsupported | 25 | Yes |
| False | 0 | Yes |
| Unresolved | — | No |
| Pending | — | No |

The calculation is:

```text
Trust Score = sum(score_points) / (number of scored claims × 100) × 100
```

For v3:

```text
4,175 / (111 × 100) × 100 = 37.6
```

The homepage rounds this to **38/100**. The detail page should show the exact score, denominator, verdict counts, and evidence for every row.

## Rating bands

| Score | Public conclusion |
|---:|---|
| 80–100 | Highly Trustworthy |
| 65–79 | Generally Trustworthy |
| 45–64 | Inconsistent |
| 25–44 | Not Trustworthy |
| 0–24 | Highly Untrustworthy |

These are editorial thresholds, not scientific constants, and are disclosed so visitors can evaluate them.

## Primary verdict rules

### True

The central factual proposition is supported by high-quality evidence, or a commitment was fulfilled materially as stated and on time.

### Mostly True

The central takeaway remains substantially intact after a limited correction, qualification, delay, or scope deviation.

### Misleading

Some portion is accurate, but omitted context, framing, timing, scope, or capability materially changes the conclusion a reasonable reader would draw.

### Unsupported

The statement asserts a specific fact, allegation, motive, capability, or outcome without adequate credible support. The available record does not justify a conclusive False verdict. Unsupported receives partial rather than full credit because the speaker did not earn trust for the affirmative assertion.

### False

Reliable evidence directly contradicts the central proposition, or a measurable commitment matured and was not fulfilled, was abandoned, or was reversed.

### Unresolved

Credible evidence materially conflicts, decisive records are private, wording is too ambiguous, or no objective threshold permits a fair verdict. These rows stay visible and are excluded from the score.

### Pending

The relevant deadline or condition had not matured by the evaluation date. Pending rows stay visible and are excluded until reevaluated.

## V3 scope expansion

V3 preserves the 100 v2 records without changing their verdicts or scores and adds 31 records:

- 19 Public discourse claims
- 6 OpenAI claims
- 3 PayPal/X.com claims
- 3 Zip2 claims

Public discourse now contains 29 records, of which 28 are scored. It earns 700 of 2800 possible points, or **25.0/100**.

V3 also adds fields for:

- related entity
- relationship to that entity
- Public discourse subcategory
- assertion mode
- correction status and date
- deletion after challenge
- repetition after correction
- documented repetition count

These metadata fields support deeper analysis but do not automatically alter the score.

## Public discourse categories

Public discourse rows use one streamlined secondary category:

- Politics & Elections
- Immigration & Demographics
- Government & Public Spending
- Science & Health
- Media & Information
- Personal & Biographical
- Accusations About Individuals
- Legal & Regulatory

The category does not change a row’s points. It enables visitors to compare where Musk’s record is stronger or weaker.

## Former organizations and official biographies

Claims involving former organizations use `relationship_to_entity = Former affiliation`. This distinguishes them from promises made while operating a current company.

Some PayPal/X.com and Zip2 rows are representations in Tesla’s official SEC-filed biography rather than direct quotations from Musk. Their `assertion_mode` explicitly says so. They are included because they are formal, recurring public representations associated with Musk’s biography, but the distinction should remain visible on the site.

## Reposts and amplification

A bare repost does not automatically make Musk the author of every proposition in the shared material. A repost is scored only when accompanying commentary, framing, or context affirmatively adopts the testable claim. The `assertion_mode` field records this distinction.

## Corrections, deletion, and repetition

A correction, acknowledgement, apology, or deletion does not erase the original claim. It is displayed as context on the detail page.

Repeated instances of the same underlying proposition are normally kept in one scored record with a repetition count. This prevents prolific repetition from mechanically overwhelming the score. A later statement becomes a separate scored row only when it contains a materially distinct proposition.

## Personal-life and accusation standards

Personal-history claims and accusations about identifiable people require a higher evidence threshold. A scored verdict should rely on one or more of the following:

- primary documents or authenticated communications
- court or government records
- on-record testimony from a person with direct knowledge
- multiple independent reports from high-quality publications

Rumor, gossip, anonymous social-media claims, and purely intimate details without public significance are excluded.

## Source standards

Preferred statement and outcome sources are:

1. Original posts, speeches, testimony, filings, company materials, or authenticated communications
2. Court records, government records, regulatory filings, and official datasets
3. Major wire services and established national publications
4. Specialist fact-checkers that cite original statements, records, data, and named experts

Official company material from an interested party can document an email, filing, or position, but contested conclusions should be paired with independent reporting or another primary record when available. Source limitations are disclosed in each row.

## False is not automatically a lie

The verdicts measure whether a statement held up under evidence. A False, Misleading, Unsupported, late, or unfulfilled verdict does not by itself prove Musk knew the statement was wrong or intended to deceive. The dataset uses `deception_intent_status` separately and defaults to “Not established” unless strong evidence supports a different conclusion.

## Selection bias and interpretation

The corpus is not a random sample. Fact-check archives and controversy-driven research naturally contain more disputed claims than ordinary speech. Company-promise sections also select concrete, high-impact commitments rather than trivial statements. The site should therefore say:

> Based on the material, verifiable public claims tracked in this database, Elon Musk’s Trust Score is 38/100, classified as Not Trustworthy.

It should not say:

> Exactly 62% of everything Elon Musk has ever said is a lie.

## Auditability and updates

Every scored row includes a statement source, an outcome source, a rationale, a confidence level, and an evaluation date. Unresolved and pending rows remain in the file. Verdict changes should create a changelog entry rather than silently overwriting the public history.

The migration CSV documents all 100 v2 rows and all 31 v3 additions. The summary CSV is calculated from the claims CSV, and the classification key defines every score-bearing verdict and metadata flag.
