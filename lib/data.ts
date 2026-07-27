import rawDataset from "@/generated-data/dataset.json";

export type Claim = {
  [key: string]: string | undefined;
  record_id: string;
  claim_family_id: string;
  schema_version: string;
  statement_date: string;
  organization_or_domain: string;
  relationship_to_organization: string;
  primary_domain: string;
  public_discourse_category: string;
  topic: string;
  claim_type: string;
  assertion_mode: string;
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
  confidence: string;
  selection_basis: string;
  source_quality_notes: string;
  methodology_notes: string;
  correction_status: string;
  correction_date: string;
  deleted_after_challenge: string;
  repeated_after_correction: string;
  repetition_count: string;
  materiality_reason: string;
  evaluation_schema_version: string;
  evaluation_as_of: string;
  sensitive_topic_tags: string;
  sensitive_topic_note: string;
  intentional_deception_established: string;
  deception_intent_evidence_level: string;
  deception_intent_rationale: string;
  deception_intent_source_urls: string;
  statement_evidence_quality_score: string;
  outcome_evidence_quality_score: string;
  corroboration_score: string;
  directness_score: string;
  evidence_strength_score: string;
  verdict_confidence_score: string;
  evidence_source_count: string;
  independent_source_domain_count: string;
  evaluation_evidence_urls: string;
  deadline_result_basis: string;
  eventual_outcome_basis: string;
  factual_accuracy_basis: string;
  verdict_basis: string;
  score_points_basis: string;
  include_in_score_basis: string;
  contestation_basis: string;
  correction_basis: string;
  repetition_basis: string;
  confidence_basis: string;
  evidence_audit_status: string;
  evidence_last_reviewed: string;
  status_rule_version?: string;
  strict_promise_result?: string;
  later_delivery_note?: string;
  audit_disposition?: string;
  reviewed_against_strict_rule?: string;
  outcome_source_2_url?: string;
  outcome_source_2_title?: string;
  legacy_methodology_notes?: string;
  legacy_statement_type?: string;
  legacy_verdict?: string;
  legacy_weighted_reliability_score?: string;
  legacy_included_in_site_percentage?: string;
};

export type ClaimIndexRecord = Pick<
  Claim,
  | "record_id"
  | "statement_date"
  | "organization_or_domain"
  | "relationship_to_organization"
  | "primary_domain"
  | "public_discourse_category"
  | "topic"
  | "claim_type"
  | "assertion_mode"
  | "statement_paraphrase"
  | "verdict_category"
  | "display_verdict"
  | "include_in_trust_score"
  | "score_points"
  | "outcome_summary"
  | "correction_status"
  | "sensitive_topic_tags"
  | "intentional_deception_established"
  | "deception_intent_status"
  | "strict_promise_result"
>;

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
  record_type: string;
  classification: string;
  score_points: string;
  included_in_score: string;
  definition: string;
  promise_or_commitment_display: string;
  prediction_or_forecast_display: string;
  factual_assertion_display: string;
  implementation_rule: string;
  source_sections: string;
};

export type ClassificationEntry = {
  section: string;
  key: string;
  display_label: string;
  score_or_value: string;
  include_in_trust_score: string;
  definition: string;
  calculation_or_rule: string;
  notes: string;
};

export type MigrationRow = {
  [key: string]: string;
  record_id: string;
  new_schema_version: string;
};

export type DownloadRole =
  | "claims"
  | "summary"
  | "evaluationAudit"
  | "sourceAudit"
  | "methodology"
  | "classificationKey"
  | "migration"
  | "datasetReadme";

export type DatasetDownload = {
  role: DownloadRole;
  label: string;
  fileName: string;
  href: string;
};

type DatasetMeta = {
  schemaVersion: string;
  sourceSchemaVersion: string;
  versionLabel: string;
  sourceVersionLabel: string;
  migrationLabel: string;
  evaluationDate: string;
  evaluationSchemaVersion: string;
  statusRuleVersion: string | null;
  fieldCount: number;
  totalRecords: number;
  scoredClaims: number;
  excludedClaims: number;
  pointsEarned: number;
  pointsPossible: number;
  maxScorePoints: number;
  exactScore: number;
  roundedScore: number;
  conclusion: string;
  primaryVerdictCount: number;
  scoredVerdictCount: number;
  excludedVerdictCount: number;
  citationCount: number;
  uniqueSourceCount: number;
  undatedClaimCount: number;
  subjectCategoryCount: number;
  organizationContextCount: number;
  topicCategoryClaimCount: number;
  topicCategoryCount: number;
  intentAnswerCounts: Record<string, number>;
  intentAssessmentCounts: Record<string, number>;
  auditMetricCount: number;
  evaluationAuditRecordCount: number;
  sourceAuditRecordCount: number;
  averageEvidenceStrength: number;
  averageVerdictConfidence: number;
  rowsWithTwoSources: number;
  rowsWithTwoIndependentDomains: number;
  completeAuditClaims: number;
  sourceFiles: Record<DownloadRole, string>;
  downloads: DatasetDownload[];
};

export type EvidenceMetricDefinition = {
  field: string;
  label: string;
  maximum: number;
  definition: string;
  rule: string;
  notes: string;
};

export type RatingBand = {
  minimum: number;
  maximum: number;
  range: string;
  label: string;
};

type Dataset = {
  meta: DatasetMeta;
  claims: Claim[];
  summary: SummaryRow[];
  classificationKey: ClassificationRule[];
  classificationEntries: ClassificationEntry[];
  evidenceMetrics: EvidenceMetricDefinition[];
  ratingBands: RatingBand[];
  migration: MigrationRow[];
};

const dataset = rawDataset as unknown as Dataset;

export const claims = dataset.claims;
export const summary = dataset.summary;
export const classificationKey = dataset.classificationKey;
export const classificationEntries = dataset.classificationEntries;
export const evidenceMetrics = dataset.evidenceMetrics;
export const ratingBands = dataset.ratingBands;
export const migration = dataset.migration;
export const datasetDownloads = dataset.meta.downloads;
export const downloadByRole = Object.fromEntries(
  datasetDownloads.map((download) => [download.role, download]),
) as Record<DownloadRole, DatasetDownload>;

const classificationByName = new Map(
  classificationKey.map((rule) => [rule.classification, rule]),
);
const scoredRules = classificationKey.filter(
  (rule) => rule.included_in_score === "Yes",
);
const excludedRules = classificationKey.filter(
  (rule) => rule.included_in_score === "No",
);

export const datasetStats = {
  ...dataset.meta,
  version: dataset.meta.schemaVersion,
  highConfidenceClaims: claims.filter((claim) => claim.confidence === "High")
    .length,
  contestedClaims: claims.filter(
    (claim) => claim.credible_sources_contest_claim === "Yes",
  ).length,
  claimTypeCount: new Set(
    claims.map((claim) => claim.claim_type).filter(Boolean),
  ).size,
};

export const claimIndexRecords: ClaimIndexRecord[] = claims.map((claim) => ({
  record_id: claim.record_id,
  statement_date: claim.statement_date,
  organization_or_domain: claim.organization_or_domain,
  relationship_to_organization: claim.relationship_to_organization,
  primary_domain: claim.primary_domain,
  public_discourse_category: claim.public_discourse_category,
  topic: claim.topic,
  claim_type: claim.claim_type,
  assertion_mode: claim.assertion_mode,
  statement_paraphrase: claim.statement_paraphrase,
  verdict_category: claim.verdict_category,
  display_verdict: claim.display_verdict,
  include_in_trust_score: claim.include_in_trust_score,
  score_points: claim.score_points,
  outcome_summary: claim.outcome_summary,
  correction_status: claim.correction_status,
  sensitive_topic_tags: claim.sensitive_topic_tags,
  intentional_deception_established:
    claim.intentional_deception_established,
  deception_intent_status: claim.deception_intent_status,
  strict_promise_result: claim.strict_promise_result,
}));

export const verdictLabels: Record<string, string> = Object.fromEntries(
  classificationKey.map((rule) => [rule.classification, rule.classification]),
);

export const verdictDescriptions: Record<string, string> = Object.fromEntries(
  classificationKey.map((rule) => [rule.classification, rule.definition]),
);

function scoreRatio(rule: ClassificationRule) {
  if (
    rule.included_in_score !== "Yes" ||
    rule.score_points === "" ||
    datasetStats.maxScorePoints === 0
  ) {
    return null;
  }
  return Number(rule.score_points) / datasetStats.maxScorePoints;
}

export function verdictTone(verdict: string) {
  const rule = classificationByName.get(verdict);
  const ratio = rule ? scoreRatio(rule) : null;
  if (ratio === null) return "mixed";
  if (ratio >= 0.75) return "positive";
  if (ratio === 0) return "negative";
  return "mixed";
}

export const verdictToneByName = Object.fromEntries(
  classificationKey.map((rule) => [
    rule.classification,
    verdictTone(rule.classification),
  ]),
) as Record<string, ReturnType<typeof verdictTone>>;

const tonePalettes = {
  positive: ["#2d6651", "#66917f", "#8cab9d"],
  mixed: ["#b58a24", "#806719", "#777a72", "#2258a5", "#6f5d86"],
  negative: ["#a33a31", "#7f2923"],
};

const toneIndexes = {
  positive: 0,
  mixed: 0,
  negative: 0,
};

export const verdictColors: Record<string, string> = Object.fromEntries(
  classificationKey.map((rule) => {
    const tone = verdictTone(rule.classification);
    const palette = tonePalettes[tone];
    const color = palette[toneIndexes[tone] % palette.length];
    toneIndexes[tone] += 1;
    return [rule.classification, color];
  }),
);

export type ScoreBreakdown = {
  name: string;
  points: number | null;
  count: number;
  totalRecords: number;
  score: number | null;
};

function groupScores(field: keyof Claim) {
  const groups = new Map<string, Claim[]>();

  for (const claim of claims) {
    const name = claim[field];
    if (!name) continue;
    const group = groups.get(name) ?? [];
    group.push(claim);
    groups.set(name, group);
  }

  return [...groups.entries()]
    .map(([name, groupClaims]): ScoreBreakdown => {
      const groupScored = groupClaims.filter(
        (claim) => claim.include_in_trust_score === "Yes",
      );
      const points = groupScored.reduce(
        (total, claim) => total + Number(claim.score_points),
        0,
      );
      return {
        name,
        points: groupScored.length === 0 ? null : points,
        count: groupScored.length,
        totalRecords: groupClaims.length,
        score:
          groupScored.length === 0
            ? null
            : Number(
                (
                  (points /
                    (groupScored.length * datasetStats.maxScorePoints)) *
                  100
                ).toFixed(1),
              ),
      };
    })
    .sort(
      (left, right) =>
        (right.score ?? Number.NEGATIVE_INFINITY) -
          (left.score ?? Number.NEGATIVE_INFINITY) ||
        left.name.localeCompare(right.name),
    );
}

export const subjectCategoryScores = groupScores("primary_domain");

export const claimTypeScores = groupScores("claim_type");

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

const supportedVerdicts = new Set(
  scoredRules
    .filter((rule) => (scoreRatio(rule) ?? 0) >= 0.75)
    .map((rule) => rule.classification),
);
const zeroPointVerdicts = new Set(
  scoredRules
    .filter((rule) => Number(rule.score_points) === 0)
    .map((rule) => rule.classification),
);

export const zeroPointVerdictLabel =
  [...zeroPointVerdicts].join(" or ") || "zero-point";

const yearlyTrendMap = new Map<
  string,
  Omit<YearlyTrend, "score" | "falseShare" | "supportedShare">
>();

for (const claim of claims) {
  const year = claim.statement_date.match(/^(\d{4})/)?.[1];
  if (!year) continue;
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
  if (zeroPointVerdicts.has(claim.verdict_category)) entry.falseCount += 1;
  if (supportedVerdicts.has(claim.verdict_category)) {
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
        : Number(
            (
              (entry.points /
                (entry.scored * datasetStats.maxScorePoints)) *
              100
            ).toFixed(1),
          ),
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
    score:
      periodClaims.length === 0
        ? null
        : Number(
            (
              (points /
                (periodClaims.length * datasetStats.maxScorePoints)) *
              100
            ).toFixed(1),
          ),
  };
}

const latestCompleteYear =
  Number(datasetStats.evaluationDate.slice(0, 4)) - 1;
const recentTrendWindow = periodScore(
  latestCompleteYear - 4,
  latestCompleteYear,
);
const earlierTrendWindow = periodScore(
  latestCompleteYear - 9,
  latestCompleteYear - 5,
);

export const trendComparison = {
  earlier: earlierTrendWindow,
  recent: recentTrendWindow,
  delta:
    earlierTrendWindow.score === null || recentTrendWindow.score === null
      ? null
      : Number(
          (recentTrendWindow.score - earlierTrendWindow.score).toFixed(1),
        ),
};

function countVerdict(verdict: string) {
  return claims.filter((claim) => claim.verdict_category === verdict).length;
}

function percent(count: number, total = claims.length) {
  if (total === 0) return "0.0%";
  return `${((count / total) * 100).toFixed(1)}%`;
}

const supportedClaims = [...supportedVerdicts].reduce(
  (total, verdict) => total + countVerdict(verdict),
  0,
);
const zeroPointClaims = [...zeroPointVerdicts].reduce(
  (total, verdict) => total + countVerdict(verdict),
  0,
);
const supportedLabel = [...supportedVerdicts].join(" or ");
const zeroPointLabel = [...zeroPointVerdicts].join(" or ");

export const supportMetrics = [
  {
    label: "Claims included in the Trust Score",
    value: percent(datasetStats.scoredClaims),
    fraction: `${datasetStats.scoredClaims} / ${datasetStats.totalRecords}`,
    note: `${excludedRules.map((rule) => rule.classification).join(" and ")} claims remain visible but do not alter the denominator.`,
  },
  {
    label: `Claims rated ${supportedLabel}`,
    value: percent(supportedClaims),
    fraction: `${supportedClaims} / ${datasetStats.totalRecords}`,
    note: `These categories earn at least 75% of the maximum ${datasetStats.maxScorePoints}-point weight in the current classification key.`,
  },
  {
    label: `Claims rated ${zeroPointLabel}`,
    value: percent(zeroPointClaims),
    fraction: `${zeroPointClaims} / ${datasetStats.totalRecords}`,
    note: `${zeroPointLabel} earns zero points; the verdict does not by itself establish intent.`,
  },
  {
    label: "Contested by credible sources",
    value: percent(datasetStats.contestedClaims),
    fraction: `${datasetStats.contestedClaims} / ${datasetStats.totalRecords}`,
    note: "Contestation is a separate evidence badge, not a score-bearing verdict.",
  },
];

export const outcomeDistribution = classificationKey.map((rule) => ({
  key: rule.classification,
  count: countVerdict(rule.classification),
}));

export const scoreGroups = scoredRules.map((rule, index) => ({
  id: `${rule.classification
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(^-|-$)/g, "")}-${index}`,
  label: rule.classification,
  count: countVerdict(rule.classification),
  published: Number(rule.score_points),
}));

export const subjectCategoryNames = [
  ...new Set(claims.map((claim) => claim.primary_domain)),
].sort();

export const organizationContextNames = [
  ...new Set(
    claims
      .map((claim) => claim.organization_or_domain)
      .filter((context): context is string => Boolean(context)),
  ),
].sort();

export const topicCategoryNames = [
  ...new Set(
    claims
      .map((claim) => claim.public_discourse_category)
      .filter((category): category is string => Boolean(category)),
  ),
].sort();

export type DistributionEntry = {
  label: string;
  count: number;
};

function distributionFromCounts(
  counts: Record<string, number>,
): DistributionEntry[] {
  return Object.entries(counts).map(([label, count]) => ({ label, count }));
}

export const intentAnswerDistribution = distributionFromCounts(
  datasetStats.intentAnswerCounts,
);

export const intentAssessmentDistribution = distributionFromCounts(
  datasetStats.intentAssessmentCounts,
);

export const evidenceMetricDefinitions = evidenceMetrics;

export const intentStatusDefinitions = classificationEntries
  .filter((entry) => ["Intent status", "Intent"].includes(entry.section))
  .map((entry) => ({
    status: entry.key,
    label: entry.display_label,
    definition: entry.definition,
  }));

const strictPromiseClaims = claims.filter(
  (claim) =>
    claim.strict_promise_result &&
    claim.strict_promise_result !== "Not applicable",
);
const strictPromiseResultCounts = Object.fromEntries(
  ["Pass", "Fail", "Pending", "Unresolved"].map((result) => [
    result,
    strictPromiseClaims.filter(
      (claim) => claim.strict_promise_result === result,
    ).length,
  ]),
) as Record<string, number>;
const resolvedStrictPromiseCount =
  strictPromiseResultCounts.Pass + strictPromiseResultCounts.Fail;

export const strictPromiseAudit =
  strictPromiseClaims.length === 0
    ? null
    : {
        total: strictPromiseClaims.length,
        resolved: resolvedStrictPromiseCount,
        counts: strictPromiseResultCounts,
        resolvedPassRate:
          resolvedStrictPromiseCount === 0
            ? null
            : Number(
                (
                  (strictPromiseResultCounts.Pass /
                    resolvedStrictPromiseCount) *
                  100
                ).toFixed(1),
              ),
        ruleVersion: datasetStats.statusRuleVersion,
      };

export const claimTypeNames = [
  ...new Set(claims.map((claim) => claim.claim_type)),
].sort();

export const migrationChanges = Object.entries(
  migration.reduce<Record<string, number>>((counts, row) => {
    const label = row.change_type || "Updated";
    counts[label] = (counts[label] ?? 0) + 1;
    return counts;
  }, {}),
).map(([label, count]) => ({ label, count }));

export const featuredClaims = [
  scoredRules.at(0),
  scoredRules.at(Math.floor((scoredRules.length - 1) / 2)),
  scoredRules.at(-1),
]
  .filter((rule): rule is ClassificationRule => rule !== undefined)
  .map((rule) =>
    claims.find((claim) => claim.verdict_category === rule.classification),
  )
  .filter((claim): claim is Claim => claim !== undefined);

export function formatVerdict(verdict: string) {
  return verdictLabels[verdict] ?? verdict.replaceAll("_", " ");
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

export function findClassificationRule(classification: string) {
  return classificationByName.get(classification);
}

export function findMigration(recordId: string) {
  return migration.find((row) => row.record_id === recordId);
}

export function claimSources(claim: Claim) {
  const sources = [
    {
      key: "statement",
      href: claim.statement_source_url,
      title: claim.statement_source_title,
      label: `Original statement · ${claim.statement_source_tier}`,
    },
  ];

  const outcomeIndexes = Object.keys(claim)
    .map((key) => key.match(/^outcome_source_(\d+)_url$/)?.[1])
    .filter((value): value is string => value !== undefined)
    .map(Number)
    .sort((left, right) => left - right);

  for (const index of outcomeIndexes) {
    const href = claim[`outcome_source_${index}_url`];
    const title = claim[`outcome_source_${index}_title`];
    if (!href || !title) continue;
    sources.push({
      key: `outcome-${index}`,
      href,
      title,
      label:
        index === 1
          ? "Primary outcome source"
          : `Additional outcome source ${index - 1}`,
    });
  }

  return sources;
}
