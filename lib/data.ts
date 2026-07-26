import rawClaims from "@/data/claims.json";
import rawSummary from "@/data/summary.json";

export type Claim = {
  record_id: string;
  statement_date: string;
  organization_or_domain: string;
  topic: string;
  statement_type: string;
  statement_paraphrase: string;
  target_date_or_timeframe: string;
  statement_source_url: string;
  statement_source_title: string;
  statement_source_tier: string;
  evaluation_date: string;
  verdict: string;
  deadline_result: string;
  eventual_fulfillment: string;
  factual_accuracy: string;
  binary_resolved_score: string;
  on_time_score: string;
  weighted_reliability_score: string;
  deception_intent_status: string;
  outcome_summary: string;
  outcome_source_1_url: string;
  outcome_source_1_title: string;
  outcome_source_2_url: string;
  outcome_source_2_title: string;
  confidence: string;
  included_in_site_percentage: string;
  selection_basis: string;
  source_quality_notes: string;
  methodology_notes: string;
};

export type SummaryRow = {
  section: string;
  metric: string;
  organization_or_domain: string;
  numerator: string;
  denominator: string;
  percentage: string;
  source_or_formula: string;
  interpretation_and_caveat: string;
};

export const claims = rawClaims as Claim[];
export const summary = rawSummary as SummaryRow[];

export const verdictLabels: Record<string, string> = {
  FALSE: "False",
  FALSE_OR_UNSUPPORTED: "False or unsupported",
  FULFILLED: "Fulfilled",
  FULFILLED_LATE: "Fulfilled late",
  FULFILLED_ON_TIME: "Fulfilled on time",
  NOT_FULFILLED: "Not fulfilled",
  PARTIALLY_FULFILLED: "Partially fulfilled",
  PENDING: "Pending",
  PROMISE_REVERSED: "Promise reversed",
  UNCLEAR: "Unclear",
  UNSCORABLE: "Unscorable",
};

export const verdictDescriptions: Record<string, string> = {
  FULFILLED_ON_TIME: "The promised result happened within the stated deadline.",
  FULFILLED: "The result happened and no explicit deadline was missed.",
  FULFILLED_LATE: "The result happened, but after the stated deadline.",
  PARTIALLY_FULFILLED:
    "A meaningful part happened, but material scope remained unmet or unverifiable.",
  NOT_FULFILLED: "A mature promise or forecast did not happen.",
  PROMISE_REVERSED: "Musk later did the opposite of an explicit commitment.",
  FALSE:
    "Reliable evidence contradicts the factual assertion.",
  FALSE_OR_UNSUPPORTED:
    "Reliable evidence contradicts the assertion or the claimed support was absent.",
  PENDING: "The deadline has not elapsed.",
  UNCLEAR:
    "Public evidence is inadequate or the conditions remain unresolved.",
  UNSCORABLE:
    "The statement is too vague for an objective verdict.",
};

export const organizationScores = [
  { name: "Neuralink", points: 3.25, count: 5, score: 65.0 },
  { name: "X / Twitter", points: 2.75, count: 6, score: 45.8 },
  { name: "SpaceX", points: 4.0, count: 9, score: 44.4 },
  { name: "Tesla", points: 15.75, count: 46, score: 34.2 },
  { name: "The Boring Company", points: 0.75, count: 5, score: 15.0 },
  { name: "Public discourse", points: 0, count: 10, score: 0 },
];

export const supportMetrics = [
  {
    label: "Resolved accuracy or eventual fulfillment",
    value: "43.0%",
    fraction: "34 / 79",
    note: "Combines resolved factual claims with promises that eventually happened.",
  },
  {
    label: "Promises eventually fulfilled",
    value: "50.8%",
    fraction: "33 / 65",
    note: "Counts resolved promises that happened, including late delivery.",
  },
  {
    label: "Dated promises completed on time",
    value: "13.3%",
    fraction: "8 / 60",
    note: "A late success still counts as a missed deadline here.",
  },
  {
    label: "Selected factual claims accurate",
    value: "7.1%",
    fraction: "1 / 14",
    note: "This subset is heavily selection-biased toward disputed statements.",
  },
];

export const outcomeDistribution = [
  { key: "NOT_FULFILLED", count: 31 },
  { key: "FULFILLED_LATE", count: 21 },
  { key: "PENDING", count: 11 },
  { key: "FALSE", count: 10 },
  { key: "FULFILLED_ON_TIME", count: 7 },
  { key: "PARTIALLY_FULFILLED", count: 7 },
  { key: "FULFILLED", count: 6 },
  { key: "FALSE_OR_UNSUPPORTED", count: 3 },
  { key: "UNCLEAR", count: 2 },
  { key: "PROMISE_REVERSED", count: 1 },
  { key: "UNSCORABLE", count: 1 },
];

export const ratingBands = [
  { range: "80–100", label: "Highly trustworthy" },
  { range: "60–79", label: "Generally trustworthy" },
  { range: "40–59", label: "Inconsistent" },
  { range: "0–39", label: "Not trustworthy" },
];

export function formatVerdict(verdict: string) {
  return verdictLabels[verdict] ?? verdict.replaceAll("_", " ").toLowerCase();
}

export function verdictTone(verdict: string) {
  if (["FULFILLED", "FULFILLED_ON_TIME"].includes(verdict)) return "positive";
  if (["FULFILLED_LATE", "PARTIALLY_FULFILLED", "PENDING", "UNCLEAR", "UNSCORABLE"].includes(verdict)) {
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
    claim.included_in_site_percentage !== "Yes" ||
    claim.weighted_reliability_score === ""
  ) {
    return null;
  }
  return Number(claim.weighted_reliability_score) * 100;
}

export function claimTypeGroup(type: string) {
  const value = type.toLowerCase();
  if (value.includes("factual") || value.includes("capability")) {
    return "Factual / capability";
  }
  if (value.includes("forecast")) return "Forecast";
  if (value.includes("promise")) return "Promise";
  if (
    value.includes("commitment") ||
    value.includes("goal") ||
    value.includes("mission")
  ) {
    return "Commitment / goal";
  }
  return "Other";
}

export function findClaim(recordId: string) {
  return claims.find((claim) => claim.record_id === recordId);
}
