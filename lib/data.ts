import rawClaims from "@/data/claims.json";
import rawClassificationKey from "@/data/classification-key.json";
import rawSummary from "@/data/summary.json";

export type Claim = {
  record_id: string;
  schema_version: string;
  statement_date: string;
  organization_or_domain: string;
  primary_domain: string;
  topic: string;
  claim_type: string;
  statement_paraphrase: string;
  target_date_or_timeframe: string;
  statement_source_url: string;
  statement_source_title: string;
  statement_source_tier: string;
  evaluation_date: string;
  verdict_category: string;
  display_verdict: string;
  score_points: string;
  include_in_trust_score: string;
  exclusion_reason: string;
  classification_rationale: string;
  credible_sources_contest_claim: string;
  contestation_resolution: string;
  deadline_result: string;
  eventual_outcome: string;
  factual_accuracy: string;
  deception_intent_status: string;
  outcome_summary: string;
  outcome_source_1_url: string;
  outcome_source_1_title: string;
  outcome_source_2_url: string;
  outcome_source_2_title: string;
  confidence: string;
  selection_basis: string;
  source_quality_notes: string;
  methodology_notes: string;
  legacy_methodology_notes: string;
  legacy_statement_type: string;
  legacy_verdict: string;
  legacy_weighted_reliability_score: string;
  legacy_included_in_site_percentage: string;
};

export type SummaryRow = {
  section: string;
  metric: string;
  group: string;
  count: string;
  total_records: string;
  points_earned: string;
  points_possible: string;
  percentage_or_score: string;
  conclusion: string;
  formula_or_rule: string;
  interpretation_and_caveat: string;
};

export type ClassificationRule = {
  classification: string;
  score_points: string;
  included_in_score: string;
  definition: string;
  promise_or_commitment_display: string;
  prediction_or_forecast_display: string;
};

export const claims = rawClaims as Claim[];
export const summary = rawSummary as SummaryRow[];
export const classificationKey = rawClassificationKey as ClassificationRule[];

const scoredClaims = claims.filter(
  (claim) => claim.include_in_trust_score === "Yes",
);
const pointsEarned = scoredClaims.reduce(
  (total, claim) => total + Number(claim.score_points),
  0,
);
const pointsPossible = scoredClaims.length * 100;
const exactScore = Number(((pointsEarned / pointsPossible) * 100).toFixed(1));
const overallSummary = summary.find(
  (row) =>
    row.section === "Overall" && row.metric === "Elon Musk Trust Score",
);

export const datasetStats = {
  version: "2.0",
  evaluationDate: claims
    .map((claim) => claim.evaluation_date)
    .sort()
    .at(-1) ?? "2026-07-26",
  totalRecords: claims.length,
  scoredClaims: scoredClaims.length,
  excludedClaims: claims.length - scoredClaims.length,
  pointsEarned,
  pointsPossible,
  exactScore,
  roundedScore: Math.round(exactScore),
  conclusion: overallSummary?.conclusion ?? "Not Trustworthy",
  highConfidenceClaims: claims.filter((claim) => claim.confidence === "High")
    .length,
  contestedClaims: claims.filter(
    (claim) => claim.credible_sources_contest_claim === "Yes",
  ).length,
};

export const verdictLabels: Record<string, string> = Object.fromEntries(
  classificationKey.map((rule) => [rule.classification, rule.classification]),
);

export const verdictDescriptions: Record<string, string> = Object.fromEntries(
  classificationKey.map((rule) => [rule.classification, rule.definition]),
);

const verdictOrder = [
  "True",
  "Mostly True",
  "Misleading",
  "Unsupported",
  "False",
  "Unresolved",
  "Pending",
];

export const organizationScores = summary
  .filter(
    (row) =>
      row.section === "By organization" &&
      row.metric === "Trust Score" &&
      row.percentage_or_score !== "",
  )
  .map((row) => ({
    name: row.group,
    points: Number(row.points_earned),
    count: Number(row.count),
    totalRecords: Number(row.total_records),
    score: Number(row.percentage_or_score),
  }))
  .sort((left, right) => right.score - left.score);

export const domainScores = summary
  .filter(
    (row) =>
      row.section === "By primary domain" &&
      row.metric === "Trust Score" &&
      row.percentage_or_score !== "",
  )
  .map((row) => ({
    name: row.group,
    points: Number(row.points_earned),
    count: Number(row.count),
    totalRecords: Number(row.total_records),
    score: Number(row.percentage_or_score),
  }))
  .sort((left, right) => right.score - left.score);

export const claimTypeScores = summary
  .filter(
    (row) =>
      row.section === "By claim type" && row.metric === "Trust Score",
  )
  .map((row) => ({
    name: row.group,
    points: row.points_earned === "" ? null : Number(row.points_earned),
    count: Number(row.count),
    totalRecords: Number(row.total_records),
    score:
      row.percentage_or_score === ""
        ? null
        : Number(row.percentage_or_score),
    conclusion: row.conclusion,
  }));

export type YearlyTrend = {
  year: string;
  total: number;
  scored: number;
  points: number;
  score: number | null;
  falseCount: number;
  falseShare: number;
  supportedCount: number;
  supportedShare: number;
  excludedCount: number;
};

const yearlyTrendMap = new Map<
  string,
  Omit<YearlyTrend, "score" | "falseShare" | "supportedShare">
>();

for (const claim of claims) {
  const year = claim.statement_date.slice(0, 4);
  const entry = yearlyTrendMap.get(year) ?? {
    year,
    total: 0,
    scored: 0,
    points: 0,
    falseCount: 0,
    supportedCount: 0,
    excludedCount: 0,
  };

  entry.total += 1;
  if (claim.include_in_trust_score === "Yes") {
    entry.scored += 1;
    entry.points += Number(claim.score_points);
  } else {
    entry.excludedCount += 1;
  }
  if (claim.verdict_category === "False") entry.falseCount += 1;
  if (["True", "Mostly True"].includes(claim.verdict_category)) {
    entry.supportedCount += 1;
  }

  yearlyTrendMap.set(year, entry);
}

export const yearlyTrends: YearlyTrend[] = [...yearlyTrendMap.values()]
  .sort((left, right) => left.year.localeCompare(right.year))
  .map((entry) => ({
    ...entry,
    score:
      entry.scored === 0
        ? null
        : Number((entry.points / entry.scored).toFixed(1)),
    falseShare: Number(((entry.falseCount / entry.total) * 100).toFixed(1)),
    supportedShare: Number(
      ((entry.supportedCount / entry.total) * 100).toFixed(1),
    ),
  }));

function periodScore(startYear: number, endYear: number) {
  const periodClaims = claims.filter((claim) => {
    const year = Number(claim.statement_date.slice(0, 4));
    return (
      year >= startYear &&
      year <= endYear &&
      claim.include_in_trust_score === "Yes"
    );
  });
  const points = periodClaims.reduce(
    (total, claim) => total + Number(claim.score_points),
    0,
  );

  return {
    label: `${startYear}–${endYear}`,
    count: periodClaims.length,
    points,
    score: Number((points / periodClaims.length).toFixed(1)),
  };
}

const earlierTrendWindow = periodScore(2016, 2020);
const recentTrendWindow = periodScore(2021, 2025);

export const trendComparison = {
  earlier: earlierTrendWindow,
  recent: recentTrendWindow,
  delta: Number(
    (recentTrendWindow.score - earlierTrendWindow.score).toFixed(1),
  ),
};

function countVerdict(verdict: string) {
  return claims.filter((claim) => claim.verdict_category === verdict).length;
}

function percent(count: number, total = claims.length) {
  return `${((count / total) * 100).toFixed(1)}%`;
}

const supportedClaims =
  countVerdict("True") + countVerdict("Mostly True");
const falseClaims = countVerdict("False");

export const supportMetrics = [
  {
    label: "Claims included in the Trust Score",
    value: percent(datasetStats.scoredClaims),
    fraction: `${datasetStats.scoredClaims} / ${datasetStats.totalRecords}`,
    note: "Pending and genuinely unresolved claims remain visible but do not alter the denominator.",
  },
  {
    label: "Claims rated True or Mostly True",
    value: percent(supportedClaims),
    fraction: `${supportedClaims} / ${datasetStats.totalRecords}`,
    note: "These records earned full or three-quarter credit under the v2 classification key.",
  },
  {
    label: "Claims rated False",
    value: percent(falseClaims),
    fraction: `${falseClaims} / ${datasetStats.totalRecords}`,
    note: "False means contradicted, unfulfilled, or reversed; it does not by itself establish intent.",
  },
  {
    label: "Contested by credible sources",
    value: percent(datasetStats.contestedClaims),
    fraction: `${datasetStats.contestedClaims} / ${datasetStats.totalRecords}`,
    note: "Contestation is a separate evidence badge, not a score-bearing verdict.",
  },
];

export const outcomeDistribution = verdictOrder.map((key) => ({
  key,
  count: countVerdict(key),
}));

export const scoreGroups = classificationKey
  .filter((rule) => rule.included_in_score === "Yes")
  .map((rule) => ({
    id: rule.classification.toLowerCase().replaceAll(" ", "-"),
    label: rule.classification,
    count: countVerdict(rule.classification),
    published: Number(rule.score_points),
  }));

export const ratingBands = [
  { range: "80–100", label: "Highly Trustworthy" },
  { range: "65–79", label: "Generally Trustworthy" },
  { range: "45–64", label: "Inconsistent" },
  { range: "25–44", label: "Not Trustworthy" },
  { range: "0–24", label: "Highly Untrustworthy" },
];

export function formatVerdict(verdict: string) {
  return verdictLabels[verdict] ?? verdict.replaceAll("_", " ");
}

export function verdictTone(verdict: string) {
  if (["True", "Mostly True"].includes(verdict)) return "positive";
  if (
    ["Misleading", "Unsupported", "Unresolved", "Pending"].includes(verdict)
  ) {
    return "mixed";
  }
  return "negative";
}

export function formatDate(value: string) {
  if (/^\d{4}$/.test(value)) return value;
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, month - 1, 1)));
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, month - 1, day)));
  }
  return value;
}

export function claimScore(claim: Claim) {
  if (
    claim.include_in_trust_score !== "Yes" ||
    claim.score_points === ""
  ) {
    return null;
  }
  return Number(claim.score_points);
}

export function claimTypeGroup(type: string) {
  return type;
}

export function findClaim(recordId: string) {
  return claims.find((claim) => claim.record_id === recordId);
}
