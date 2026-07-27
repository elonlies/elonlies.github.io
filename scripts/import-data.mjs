import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultDataDir = path.join(root, "data");
const defaultGeneratedDir = path.join(root, "generated-data");
const defaultDownloadDir = path.join(root, "public", "downloads");

export const datasetFileNames = Object.freeze({
  claims: "claims.csv",
  summary: "summary.csv",
  evaluationAudit: "evaluation-audit.csv",
  sourceAudit: "source-audit.csv",
  methodology: "methodology.md",
  classificationKey: "classification-key.csv",
  migration: "migration.csv",
  datasetReadme: "dataset-readme.md",
});

const schemaVersionPattern = /^(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*))*$/;

const requiredClaimHeaders = [
  "record_id",
  "schema_version",
  "statement_date",
  "organization_or_domain",
  "primary_domain",
  "topic",
  "claim_type",
  "statement_paraphrase",
  "target_date_or_timeframe",
  "statement_source_url",
  "statement_source_title",
  "statement_source_tier",
  "evaluation_date",
  "verdict_category",
  "display_verdict",
  "score_points",
  "include_in_trust_score",
  "exclusion_reason",
  "classification_rationale",
  "credible_sources_contest_claim",
  "contestation_resolution",
  "deadline_result",
  "eventual_outcome",
  "factual_accuracy",
  "deception_intent_status",
  "outcome_summary",
  "outcome_source_1_url",
  "outcome_source_1_title",
  "confidence",
  "selection_basis",
  "source_quality_notes",
  "methodology_notes",
  "relationship_to_organization",
  "repetition_count",
  "evaluation_schema_version",
  "evaluation_as_of",
  "intentional_deception_established",
  "deception_intent_evidence_level",
  "deception_intent_rationale",
  "deception_intent_source_urls",
  "statement_evidence_quality_score",
  "outcome_evidence_quality_score",
  "corroboration_score",
  "directness_score",
  "evidence_strength_score",
  "verdict_confidence_score",
  "evidence_source_count",
  "independent_source_domain_count",
  "evaluation_evidence_urls",
  "deadline_result_basis",
  "eventual_outcome_basis",
  "factual_accuracy_basis",
  "verdict_basis",
  "score_points_basis",
  "include_in_score_basis",
  "contestation_basis",
  "correction_basis",
  "repetition_basis",
  "confidence_basis",
  "evidence_audit_status",
  "evidence_last_reviewed",
];

const strictPromiseClaimHeaders = [
  "status_rule_version",
  "strict_promise_result",
  "later_delivery_note",
  "audit_disposition",
  "reviewed_against_strict_rule",
];

const requiredSummaryHeaders = [
  "section",
  "metric",
  "group",
  "count",
  "total_records",
  "points_earned",
  "points_possible",
  "percentage_or_score",
  "conclusion",
  "formula_or_rule",
  "interpretation_and_caveat",
];

const requiredEvaluationAuditHeaders = [
  "record_id",
  "metric_name",
  "metric_value",
  "evidence_basis",
  "evidence_urls",
  "evidence_titles",
  "calculation_rule",
  "evidence_strength_score",
  "verdict_confidence_score",
  "confidence_band",
  "audit_status",
];

const requiredSourceAuditHeaders = [
  "record_id",
  "statement_source_url",
  "statement_source_title",
  "statement_source_tier",
  "statement_evidence_quality_score",
  "outcome_source_1_url",
  "outcome_source_1_title",
  "outcome_source_2_url",
  "outcome_source_2_title",
  "outcome_evidence_quality_score",
  "corroboration_score",
  "directness_score",
  "evidence_strength_score",
  "verdict_confidence_score",
  "confidence",
  "evidence_source_count",
  "independent_source_domain_count",
  "credible_sources_contest_claim",
  "source_audit_status",
  "notes",
];

const evaluationMetricFields = Object.freeze({
  deadline_result: "deadline_result",
  eventual_outcome: "eventual_outcome",
  factual_accuracy: "factual_accuracy",
  verdict_category: "verdict_category",
  score_points: "score_points",
  include_in_trust_score: "include_in_trust_score",
  confidence: "confidence",
  credible_sources_contest_claim: "credible_sources_contest_claim",
  correction_status: "correction_status",
  repeated_after_correction: "repeated_after_correction",
  intentional_deception_established: "intentional_deception_established",
  strict_promise_result: "strict_promise_result",
});

const summaryGroupDefinitions = [
  {
    sections: ["By subject category", "By primary domain", "Primary domain"],
    field: "primary_domain",
  },
  {
    sections: ["By organization", "Organization/domain"],
    field: "organization_or_domain",
  },
  {
    sections: ["By organization or entity", "By related entity"],
    field: "related_entity",
  },
  { sections: ["By claim type", "Claim type"], field: "claim_type" },
  {
    sections: ["By relationship"],
    field: "relationship_to_organization",
  },
  {
    sections: ["By relationship to entity"],
    field: "relationship_to_entity",
  },
  {
    sections: [
      "By public discourse category",
      "Public discourse topic",
      "Public discourse category",
    ],
    field: "public_discourse_category",
    emptyGroups: ["(Not applicable)", "Unspecified"],
  },
];

const evidenceMetricFieldAliases = Object.freeze({
  statement_evidence_quality_score: "statement_evidence_quality_score",
  "Statement evidence quality": "statement_evidence_quality_score",
  outcome_evidence_quality_score: "outcome_evidence_quality_score",
  "Outcome evidence quality": "outcome_evidence_quality_score",
  corroboration_score: "corroboration_score",
  Corroboration: "corroboration_score",
  directness_score: "directness_score",
  Directness: "directness_score",
  evidence_strength_score: "evidence_strength_score",
  "Evidence strength": "evidence_strength_score",
  verdict_confidence_score: "verdict_confidence_score",
  "Verdict confidence": "verdict_confidence_score",
});

function fail(message) {
  throw new Error(`Dataset validation failed: ${message}`);
}

function requireHeaders(actualHeaders, requiredHeaders, fileName) {
  const missing = requiredHeaders.filter(
    (header) => !actualHeaders.includes(header),
  );
  if (missing.length > 0) {
    fail(`${fileName} is missing required columns: ${missing.join(", ")}.`);
  }
}

function assertNumericField(actual, expected, context) {
  if (actual === "" && expected === null) return;
  if (actual === "" || Number(actual) !== expected) {
    fail(`${context}: expected ${expected ?? "a blank value"}, found "${actual}".`);
  }
}

function percentage(numerator, denominator) {
  if (denominator === 0) return null;
  return Number(((numerator / denominator) * 100).toFixed(1));
}

function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

export function formatVersionLabel(schemaVersion) {
  if (!schemaVersionPattern.test(schemaVersion)) {
    fail(
      `schema version "${schemaVersion}" must contain dot-separated nonnegative integers.`,
    );
  }

  const parts = schemaVersion.split(".");
  while (parts.length > 1 && parts.at(-1) === "0") parts.pop();
  return `v${parts.join(".")}`;
}

function normalizeClassificationRows(rows) {
  if (rows.some((row) => "section" in row)) {
    const verdictSections = new Set([
      "Verdict",
      "Promise/forecast verdict",
      "Factual verdict",
    ]);
    const normalized = rows
      .filter((row) => verdictSections.has(row.section))
      .map((row, sourceIndex) => ({
        record_type: "Primary verdict",
        classification: row.key || "",
        score_points: row.score_or_value || "",
        included_in_score: row.include_in_trust_score || "",
        definition: row.definition || "",
        promise_or_commitment_display:
          row.section === "Promise/forecast verdict"
            ? row.display_label || ""
            : "",
        prediction_or_forecast_display:
          row.section === "Promise/forecast verdict"
            ? row.display_label || ""
            : "",
        factual_assertion_display:
          row.section === "Factual verdict" ? row.display_label || "" : "",
        implementation_rule: row.calculation_or_rule || "",
        source_section: row.section,
        sourceIndex,
      }));
    const byClassification = new Map();
    for (const rule of normalized) {
      const existing = byClassification.get(rule.classification);
      if (!existing) {
        byClassification.set(rule.classification, {
          ...rule,
          source_sections: rule.source_section,
        });
        continue;
      }
      if (
        existing.score_points !== rule.score_points ||
        existing.included_in_score !== rule.included_in_score
      ) {
        fail(
          `verdict "${rule.classification}" has conflicting score or inclusion rules across classification-key sections.`,
        );
      }
      const contextualText = (field) =>
        [
          [existing.source_section, existing[field]],
          [rule.source_section, rule[field]],
        ]
          .filter(([, value]) => value)
          .map(([section, value]) => `${section}: ${value}`)
          .filter((value, index, values) => values.indexOf(value) === index)
          .join(" ");
      existing.definition = contextualText("definition");
      existing.implementation_rule = contextualText("implementation_rule");
      existing.promise_or_commitment_display ||=
        rule.promise_or_commitment_display;
      existing.prediction_or_forecast_display ||=
        rule.prediction_or_forecast_display;
      existing.factual_assertion_display ||= rule.factual_assertion_display;
      existing.source_sections = [
        ...new Set(
          `${existing.source_sections},${rule.source_section}`
            .split(",")
            .filter(Boolean),
        ),
      ].join(",");
    }
    return [...byClassification.values()]
      .sort((left, right) => {
        if (left.included_in_score !== right.included_in_score) {
          return left.included_in_score === "Yes" ? -1 : 1;
        }
        if (
          left.included_in_score === "Yes" &&
          Number(left.score_points) !== Number(right.score_points)
        ) {
          return Number(right.score_points) - Number(left.score_points);
        }
        return left.sourceIndex - right.sourceIndex;
      })
      .map(({ sourceIndex: _sourceIndex, source_section: _section, ...rule }) => rule);
  }

  return rows
    .filter(
      (row) =>
        !("record_type" in row) || row.record_type === "Primary verdict",
    )
    .map((row) => ({
      record_type: row.record_type || "Primary verdict",
      classification: row.label || row.classification || "",
      score_points: row.score_points || "",
      included_in_score: row.included_in_score || "",
      definition: row.definition || "",
      promise_or_commitment_display:
        row.promise_or_commitment_display || "",
      prediction_or_forecast_display:
        row.prediction_or_forecast_display || "",
      factual_assertion_display: row.factual_assertion_display || "",
      implementation_rule: row.implementation_rule || "",
      source_sections: row.source_sections || "Primary verdict",
    }));
}

function classificationRanges(rows, sections) {
  const acceptedSections = new Set(
    Array.isArray(sections) ? sections : [sections],
  );
  return rows
    .filter((row) => acceptedSections.has(row.section))
    .map((row) => {
      const values = (
        row.score_or_value ||
        row.display_label ||
        row.key ||
        ""
      )
        .match(/\d+(?:\.\d+)?/g)
        ?.map(Number) ?? [];
      const minimum = values[0] ?? Number.NaN;
      const maximum = values[1] ?? values[0] ?? Number.NaN;
      return {
        minimum,
        maximum,
        range: `${minimum}–${maximum}`,
        label:
          row.key ||
          (row.display_label &&
          !/^\s*\d+(?:\.\d+)?\s*[–-]\s*\d/.test(row.display_label)
            ? row.display_label
            : ""),
      };
    })
    .filter(
      (row) =>
        row.label !== "" &&
        Number.isFinite(row.minimum) &&
        Number.isFinite(row.maximum),
    )
    .sort((left, right) => right.minimum - left.minimum);
}

function normalizeEvidenceMetrics(rows) {
  const metrics = rows
    .filter((row) => row.section === "Evidence metric")
    .map((row) => {
      const field = evidenceMetricFieldAliases[row.key];
      const rangeSource =
        row.score_or_value || row.display_label || row.key || "";
      const values =
        rangeSource.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
      const maximum = values.length > 0 ? Math.max(...values) : Number.NaN;
      return {
        field,
        label:
          Object.entries(evidenceMetricFieldAliases).find(
            ([key, value]) =>
              value === field && !key.endsWith("_score"),
          )?.[0] ??
          row.key ??
          "",
        maximum,
        definition: row.definition || "",
        rule: row.calculation_or_rule || "",
        notes: row.notes || "",
      };
    });
  const invalid = metrics.filter(
    (metric) =>
      !metric.field ||
      !Number.isFinite(metric.maximum) ||
      metric.maximum <= 0,
  );
  if (invalid.length > 0) {
    fail(
      `Evidence metric rows must map to known fields and publish a positive maximum: ${invalid
        .map((metric) => metric.label || "(blank)")
        .join(", ")}.`,
    );
  }
  const duplicateFields = metrics
    .map((metric) => metric.field)
    .filter((field, index, fields) => fields.indexOf(field) !== index);
  if (duplicateFields.length > 0) {
    fail(
      `Evidence metric fields must be unique: ${[
        ...new Set(duplicateFields),
      ].join(", ")}.`,
    );
  }
  return metrics;
}

export function parseCsv(source, fileName = "CSV file") {
  const text = source.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) fail(`${fileName} ends inside a quoted field.`);

  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  const [headers, ...records] = rows;
  if (!headers || headers.length === 0) fail(`${fileName} has no header row.`);

  const duplicateHeaders = headers.filter(
    (header, index) => header === "" || headers.indexOf(header) !== index,
  );
  if (duplicateHeaders.length > 0) {
    fail(
      `${fileName} has blank or duplicate columns: ${[
        ...new Set(duplicateHeaders.map((header) => header || "(blank)")),
      ].join(", ")}.`,
    );
  }

  records.forEach((values, index) => {
    if (values.length !== headers.length) {
      fail(
        `${fileName} row ${index + 2} has ${values.length} fields; expected ${headers.length}.`,
      );
    }
  });

  return {
    headers,
    records: records.map((values) =>
      Object.fromEntries(
        headers.map((header, index) => [header, values[index] ?? ""]),
      ),
    ),
  };
}

export function discoverDatasetPackage(fileNames) {
  const visibleFiles = fileNames.filter((fileName) => !fileName.startsWith("."));
  const expectedFiles = Object.values(datasetFileNames);
  const missingFiles = expectedFiles.filter(
    (fileName) => !visibleFiles.includes(fileName),
  );
  const unexpectedFiles = visibleFiles.filter(
    (fileName) => !expectedFiles.includes(fileName),
  );
  const duplicateFiles = visibleFiles.filter(
    (fileName, index) => visibleFiles.indexOf(fileName) !== index,
  );

  if (missingFiles.length > 0) {
    fail(`data/ is missing required files: ${missingFiles.join(", ")}.`);
  }
  if (unexpectedFiles.length > 0) {
    fail(
      `data/ must contain only the ${expectedFiles.length} stable dataset files. Unexpected files: ${unexpectedFiles.join(", ")}.`,
    );
  }
  if (duplicateFiles.length > 0) {
    fail(
      `dataset filenames must be unique. Duplicates: ${[
        ...new Set(duplicateFiles),
      ].join(", ")}.`,
    );
  }

  return Object.fromEntries(
    Object.entries(datasetFileNames).map(([role, fileName]) => [
      role,
      { fileName },
    ]),
  );
}

function validateSummary({
  claims,
  summary,
  classificationKey,
  classificationEntries,
  scoredClaims,
  pointsEarned,
  pointsPossible,
  exactScore,
  roundedScore,
  maxScorePoints,
}) {
  const uniqueSummaryKeys = new Set(
    summary.map((row) => `${row.section}\u0000${row.metric}\u0000${row.group}`),
  );
  if (uniqueSummaryKeys.size !== summary.length) {
    fail("summary rows must have unique section, metric, and group keys.");
  }

  const findSummary = (section, metric, group = "All") =>
    summary.find(
      (row) =>
        row.section === section &&
        row.metric === metric &&
        row.group === group,
    );
  const findOneSummaryAlias = (aliases, description) => {
    const matches = aliases
      .map(({ section, metric, group = "All" }) =>
        findSummary(section, metric, group),
      )
      .filter(Boolean);
    if (matches.length > 1) {
      fail(`summary publishes multiple aliases for ${description}.`);
    }
    return matches[0];
  };

  const datasetRows = [
    ["Total records", claims.length],
    ["Claims included in Trust Score", scoredClaims.length],
    ["Claims excluded from Trust Score", claims.length - scoredClaims.length],
  ];
  for (const [metric, expectedCount] of datasetRows) {
    const row = findSummary("Dataset", metric);
    if (!row) fail(`summary is missing Dataset / ${metric} / All.`);
    assertNumericField(row.count, expectedCount, `summary ${metric} count`);
    assertNumericField(
      row.total_records,
      claims.length,
      `summary ${metric} total_records`,
    );
  }

  const overall = findOneSummaryAlias(
    [
      { section: "Overall", metric: "Elon Musk Trust Score" },
      { section: "Headline", metric: "Exact Trust Score" },
    ],
    "the overall Trust Score",
  );
  if (!overall) fail("summary is missing the overall Trust Score row.");
  assertNumericField(
    overall.count,
    scoredClaims.length,
    "overall Trust Score count",
  );
  assertNumericField(
    overall.total_records,
    claims.length,
    "overall Trust Score total_records",
  );
  assertNumericField(
    overall.points_earned,
    pointsEarned,
    "overall Trust Score points_earned",
  );
  assertNumericField(
    overall.points_possible,
    pointsPossible,
    "overall Trust Score points_possible",
  );
  assertNumericField(
    overall.percentage_or_score,
    exactScore,
    "overall Trust Score percentage_or_score",
  );
  const homepageScore = findSummary(
    "Headline",
    "Homepage rounded score",
  );
  if (homepageScore) {
    assertNumericField(
      homepageScore.count,
      scoredClaims.length,
      "homepage rounded score count",
    );
    assertNumericField(
      homepageScore.total_records,
      claims.length,
      "homepage rounded score total_records",
    );
    assertNumericField(
      homepageScore.points_earned,
      pointsEarned,
      "homepage rounded score points_earned",
    );
    assertNumericField(
      homepageScore.points_possible,
      pointsPossible,
      "homepage rounded score points_possible",
    );
    assertNumericField(
      homepageScore.percentage_or_score,
      roundedScore,
      "homepage rounded score percentage_or_score",
    );
  }

  for (const rule of classificationKey) {
    const rows = claims.filter(
      (claim) => claim.verdict_category === rule.classification,
    );
    const summaryRow = findOneSummaryAlias(
      [
        {
          section: "Verdict distribution",
          metric: "Claim count",
          group: rule.classification,
        },
        {
          section: "Verdict distribution",
          metric: rule.classification,
          group: "All",
        },
      ],
      `verdict distribution for ${rule.classification}`,
    );
    if (!summaryRow) {
      fail(
        `summary is missing the Verdict distribution row for ${rule.classification}.`,
      );
    }
    assertNumericField(
      summaryRow.count,
      rows.length,
      `verdict ${rule.classification} count`,
    );
    assertNumericField(
      summaryRow.total_records,
      claims.length,
      `verdict ${rule.classification} total_records`,
    );
    assertNumericField(
      summaryRow.percentage_or_score,
      percentage(rows.length, claims.length),
      `verdict ${rule.classification} percentage_or_score`,
    );
  }

  const intentEntries = classificationEntries.filter((row) =>
    ["Intent status", "Intent"].includes(row.section),
  );
  const intentStatusGroups = new Set(intentEntries.map((row) => row.key));
  const intentAnswerGroups = new Set(
    intentEntries.map(
      (row) =>
        row.display_label ||
        (row.key === "Established"
          ? "Yes"
          : row.key === "Not assessable"
            ? "Not assessable"
            : "No"),
    ),
  );
  const publishedConfidenceGroups = new Set(
    summary
      .filter((row) => row.section === "Evidence confidence")
      .map((row) => row.group),
  );
  const confidenceGroupsFromRanges = classificationRanges(
    classificationEntries,
    "Confidence band",
  ).map((band) => band.label);
  const confidenceGroups = new Set(
    confidenceGroupsFromRanges.length > 0
      ? confidenceGroupsFromRanges
      : publishedConfidenceGroups,
  );
  const countSectionDefinitions = [
    {
      aliases: [{ section: "Intent assessment", metric: "Claim count" }],
      field: "deception_intent_status",
      allowedGroups: intentStatusGroups,
    },
    {
      aliases: [
        {
          section: "Intent answer",
          metric: "Was intentional deception established?",
        },
        {
          section: "Intentional deception",
          metric: "Was intentional deception established?",
        },
      ],
      field: "intentional_deception_established",
      allowedGroups: intentAnswerGroups,
    },
    {
      aliases: [
        { section: "Evidence confidence", metric: "Claim count" },
        {
          section: "Evidence confidence",
          metric: "Verdict confidence band",
        },
      ],
      field: "confidence",
      allowedGroups: confidenceGroups,
    },
  ];
  for (const {
    aliases,
    field,
    allowedGroups,
  } of countSectionDefinitions) {
    const publishedAliases = aliases.filter(({ section, metric }) =>
      summary.some(
        (row) => row.section === section && row.metric === metric,
      ),
    );
    if (publishedAliases.length > 1) {
      fail(
        `summary publishes multiple aliases for ${aliases[0].section}.`,
      );
    }
    const [publishedAlias] = publishedAliases;
    if (!publishedAlias) continue;
    const { section, metric } = publishedAlias;
    const sectionRows = summary.filter(
      (row) => row.section === section && row.metric === metric,
    );
    if (sectionRows.length === 0) continue;
    const expectedGroups = new Set(
      claims.map((claim) => claim[field]).filter(Boolean),
    );
    const publishedGroups = new Set(sectionRows.map((row) => row.group));
    if (
      [...expectedGroups].some((group) => !publishedGroups.has(group)) ||
      publishedGroups.size !== allowedGroups.size ||
      [...publishedGroups].some((group) => !allowedGroups.has(group))
    ) {
      fail(`${section} summary groups do not match claims.csv.`);
    }
    for (const row of sectionRows) {
      const count = claims.filter(
        (claim) => claim[field] === row.group,
      ).length;
      assertNumericField(
        row.count,
        count,
        `${section} / ${row.group} count`,
      );
      assertNumericField(
        row.total_records,
        claims.length,
        `${section} / ${row.group} total_records`,
      );
      assertNumericField(
        row.percentage_or_score,
        percentage(count, claims.length),
        `${section} / ${row.group} percentage_or_score`,
      );
    }
  }

  for (const {
    sections,
    field,
    emptyGroups,
  } of summaryGroupDefinitions) {
    const publishedSections = sections.filter((sectionName) =>
      summary.some(
        (row) =>
          row.section === sectionName && row.metric === "Trust Score",
      ),
    );
    if (publishedSections.length > 1) {
      fail(
        `summary publishes multiple aliases for the same grouping: ${publishedSections.join(", ")}.`,
      );
    }
    const [section] = publishedSections;
    if (!section) continue;
    const sectionRows = summary.filter(
      (row) => row.section === section && row.metric === "Trust Score",
    );
    const publishedGroups = new Set(sectionRows.map((row) => row.group));
    const publishedEmptyGroups = (emptyGroups ?? []).filter((group) =>
      publishedGroups.has(group),
    );
    if (publishedEmptyGroups.length > 1) {
      fail(
        `${section} summary publishes multiple aliases for unclassified rows: ${publishedEmptyGroups.join(", ")}.`,
      );
    }
    const [publishedEmptyGroup] = publishedEmptyGroups;
    const expectedGroups = new Set(
      claims
        .map(
          (claim) => claim[field] || publishedEmptyGroup || "",
        )
        .filter(Boolean),
    );
    const missingGroups = [...expectedGroups].filter(
      (group) => !publishedGroups.has(group),
    );
    if (missingGroups.length > 0) {
      fail(`${section} summary is missing groups: ${missingGroups.join(", ")}.`);
    }
    const unexpectedGroups = [...publishedGroups].filter(
      (group) => !expectedGroups.has(group),
    );
    if (unexpectedGroups.length > 0) {
      fail(
        `${section} summary has groups absent from claims.csv: ${unexpectedGroups.join(", ")}.`,
      );
    }

    for (const row of sectionRows) {
      const groupClaims = claims.filter(
        (claim) =>
          (claim[field] || publishedEmptyGroup || "") ===
          row.group,
      );
      const groupScoredClaims = groupClaims.filter(
        (claim) => claim.include_in_trust_score === "Yes",
      );
      const groupPoints = groupScoredClaims.reduce(
        (total, claim) => total + Number(claim.score_points),
        0,
      );
      const groupPossible = groupScoredClaims.length * maxScorePoints;
      const groupScore = percentage(groupPoints, groupPossible);

      assertNumericField(
        row.count,
        groupScoredClaims.length,
        `${section} / ${row.group} count`,
      );
      assertNumericField(
        row.total_records,
        groupClaims.length,
        `${section} / ${row.group} total_records`,
      );
      if (groupScoredClaims.length === 0) {
        for (const [fieldName, actual] of [
          ["points_earned", row.points_earned],
          ["points_possible", row.points_possible],
          ["percentage_or_score", row.percentage_or_score],
        ]) {
          if (actual !== "" && Number(actual) !== 0) {
            fail(
              `${section} / ${row.group} ${fieldName}: expected a blank or zero value, found "${actual}".`,
            );
          }
        }
      } else {
        assertNumericField(
          row.points_earned,
          groupPoints,
          `${section} / ${row.group} points_earned`,
        );
        assertNumericField(
          row.points_possible,
          groupPossible,
          `${section} / ${row.group} points_possible`,
        );
        assertNumericField(
          row.percentage_or_score,
          groupScore,
          `${section} / ${row.group} percentage_or_score`,
        );
      }
    }
  }

  if (claims.some((claim) => claim.strict_promise_result !== undefined)) {
    const strictClaims = claims.filter(
      (claim) => claim.strict_promise_result !== "Not applicable",
    );
    const strictResultRows = summary.filter(
      (row) =>
        row.section === "Strict promise audit" &&
        ["Pass", "Fail", "Pending", "Unresolved"].includes(row.metric) &&
        row.group === "Promises and forecasts",
    );
    if (strictResultRows.length !== 4) {
      fail(
        "summary must publish Pass, Fail, Pending, and Unresolved rows for the Strict promise audit.",
      );
    }
    for (const row of strictResultRows) {
      const count = strictClaims.filter(
        (claim) => claim.strict_promise_result === row.metric,
      ).length;
      assertNumericField(
        row.count,
        count,
        `Strict promise audit / ${row.metric} count`,
      );
      assertNumericField(
        row.total_records,
        strictClaims.length,
        `Strict promise audit / ${row.metric} total_records`,
      );
      assertNumericField(
        row.percentage_or_score,
        percentage(count, strictClaims.length),
        `Strict promise audit / ${row.metric} percentage_or_score`,
      );
    }
    const passCount = strictClaims.filter(
      (claim) => claim.strict_promise_result === "Pass",
    ).length;
    const resolvedCount = strictClaims.filter((claim) =>
      ["Pass", "Fail"].includes(claim.strict_promise_result),
    ).length;
    const resolvedRate = findSummary(
      "Strict promise audit",
      "Resolved promise/forecast pass rate",
      "Promises and forecasts",
    );
    if (!resolvedRate) {
      fail(
        "summary is missing the resolved Strict promise audit pass-rate row.",
      );
    }
    for (const [field, expected] of [
      ["count", passCount],
      ["total_records", resolvedCount],
      ["points_earned", passCount],
      ["points_possible", resolvedCount],
      ["percentage_or_score", percentage(passCount, resolvedCount)],
    ]) {
      assertNumericField(
        resolvedRate[field],
        expected,
        `Strict promise audit pass rate ${field}`,
      );
    }
  }

  const classificationRatingRows = classificationRanges(
    classificationEntries,
    ["Trust rating band", "Rating band"],
  );
  const ratingRows =
    classificationRatingRows.length > 0
      ? classificationRatingRows
      : summary
          .filter(
            (row) =>
              row.section === "Rating scale" &&
              row.metric === "Trust Score band",
          )
          .map((row) => ({
            label: row.group,
            minimum: Number(
              row.formula_or_rule.match(/\d+(?:\.\d+)?/)?.[0],
            ),
          }))
          .filter((row) => Number.isFinite(row.minimum))
          .sort((left, right) => right.minimum - left.minimum);
  if (ratingRows.length === 0) {
    fail("summary must define at least one Rating scale / Trust Score band row.");
  }
  const expectedConclusion = ratingRows.find(
    (row) => exactScore >= row.minimum,
  )?.label;
  if (!expectedConclusion || overall.conclusion !== expectedConclusion) {
    fail(
      `overall conclusion "${overall.conclusion}" does not match the rating scale conclusion "${expectedConclusion ?? "unknown"}".`,
    );
  }

  return overall;
}

function splitAuditValues(value) {
  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function averageNumericField(rows, field) {
  if (rows.length === 0) return null;
  return Number(
    (
      rows.reduce((total, row) => total + Number(row[field]), 0) /
      rows.length
    ).toFixed(1),
  );
}

function validateAudits({
  claims,
  summary,
  evidenceMetricDefinitions,
  expectedEvaluationMetricFields,
  evaluationAudit,
  sourceAudit,
}) {
  const claimById = new Map(claims.map((claim) => [claim.record_id, claim]));
  const claimIds = new Set(claimById.keys());
  const sourceAuditIds = sourceAudit.map((row) => row.record_id);
  if (
    sourceAudit.length !== claims.length ||
    new Set(sourceAuditIds).size !== sourceAudit.length ||
    sourceAuditIds.some((recordId) => !claimIds.has(recordId))
  ) {
    fail("source-audit.csv must contain exactly one row per current claim.");
  }

  const evidenceMetricMaximums = new Map(
    evidenceMetricDefinitions.map((metric) => [
      metric.field,
      metric.maximum,
    ]),
  );
  const componentFields = [
    "statement_evidence_quality_score",
    "outcome_evidence_quality_score",
    "corroboration_score",
    "directness_score",
  ];
  const sourceMirrorFields = [
    "statement_source_url",
    "statement_source_title",
    "statement_source_tier",
    "outcome_source_1_url",
    "outcome_source_1_title",
    "outcome_source_2_url",
    "outcome_source_2_title",
    ...componentFields,
    "evidence_strength_score",
    "verdict_confidence_score",
    "confidence",
    "evidence_source_count",
    "independent_source_domain_count",
    "credible_sources_contest_claim",
  ];
  const sourceProblems = [];
  for (const row of sourceAudit) {
    const claim = claimById.get(row.record_id);
    if (!claim) continue;
    for (const field of sourceMirrorFields) {
      if ((row[field] ?? "") !== (claim[field] ?? "")) {
        sourceProblems.push(`${row.record_id}: ${field} does not match claims.csv`);
      }
    }
    for (const field of componentFields) {
      const maximum = evidenceMetricMaximums.get(field);
      const value = Number(row[field]);
      if (
        !Number.isFinite(value) ||
        maximum === undefined ||
        value < 0 ||
        value > maximum
      ) {
        sourceProblems.push(`${row.record_id}: invalid ${field}`);
      }
    }
    const componentTotal = componentFields.reduce(
      (total, field) => total + Number(row[field]),
      0,
    );
    if (componentTotal !== Number(row.evidence_strength_score)) {
      sourceProblems.push(
        `${row.record_id}: evidence components do not sum to evidence_strength_score`,
      );
    }
    for (const field of [
      "evidence_strength_score",
      "verdict_confidence_score",
    ]) {
      const value = Number(row[field]);
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        sourceProblems.push(`${row.record_id}: invalid ${field}`);
      }
    }
    if (row.source_audit_status.trim() === "") {
      sourceProblems.push(`${row.record_id}: missing source_audit_status`);
    }
  }
  if (sourceProblems.length > 0) {
    fail(`invalid source audit rows:\n- ${sourceProblems.join("\n- ")}`);
  }

  const expectedMetrics = Object.keys(expectedEvaluationMetricFields);
  const auditKeys = evaluationAudit.map(
    (row) => `${row.record_id}\u0000${row.metric_name}`,
  );
  const evaluationProblems = [];
  if (
    evaluationAudit.length !== claims.length * expectedMetrics.length ||
    new Set(auditKeys).size !== evaluationAudit.length
  ) {
    evaluationProblems.push(
      `expected ${claims.length * expectedMetrics.length} unique claim/metric rows, found ${evaluationAudit.length}`,
    );
  }
  for (const claim of claims) {
    const publishedMetrics = new Set(
      evaluationAudit
        .filter((row) => row.record_id === claim.record_id)
        .map((row) => row.metric_name),
    );
    if (
      publishedMetrics.size !== expectedMetrics.length ||
      expectedMetrics.some((metric) => !publishedMetrics.has(metric))
    ) {
      evaluationProblems.push(
        `${claim.record_id}: evaluation audit metric coverage is incomplete`,
      );
    }
  }
  for (const row of evaluationAudit) {
    const claim = claimById.get(row.record_id);
    const claimField = expectedEvaluationMetricFields[row.metric_name];
    if (!claim) {
      evaluationProblems.push(`${row.record_id}: unknown claim ID`);
      continue;
    }
    if (!claimField) {
      evaluationProblems.push(
        `${row.record_id}: unknown metric ${row.metric_name}`,
      );
      continue;
    }
    if (row.metric_value !== claim[claimField]) {
      evaluationProblems.push(
        `${row.record_id} / ${row.metric_name}: value does not match claims.csv`,
      );
    }
    for (const field of [
      "evidence_basis",
      "evidence_urls",
      "evidence_titles",
      "calculation_rule",
      "confidence_band",
      "audit_status",
    ]) {
      if (row[field].trim() === "") {
        evaluationProblems.push(
          `${row.record_id} / ${row.metric_name}: missing ${field}`,
        );
      }
    }
    const evidenceUrls = splitAuditValues(row.evidence_urls);
    if (evidenceUrls.some((url) => !/^https?:\/\//.test(url))) {
      evaluationProblems.push(
        `${row.record_id} / ${row.metric_name}: invalid evidence URL`,
      );
    }
    const claimEvidenceUrls = new Set(
      splitAuditValues(claim.evaluation_evidence_urls),
    );
    if (evidenceUrls.some((url) => !claimEvidenceUrls.has(url))) {
      evaluationProblems.push(
        `${row.record_id} / ${row.metric_name}: evidence URL is absent from the claim evidence set`,
      );
    }
    const sourceTitlesByUrl = new Map([
      [claim.statement_source_url, claim.statement_source_title],
      [claim.outcome_source_1_url, claim.outcome_source_1_title],
      [claim.outcome_source_2_url, claim.outcome_source_2_title],
    ]);
    for (const url of evidenceUrls) {
      const expectedTitle = sourceTitlesByUrl.get(url);
      if (
        expectedTitle &&
        !row.evidence_titles.includes(expectedTitle)
      ) {
        evaluationProblems.push(
          `${row.record_id} / ${row.metric_name}: evidence title does not match the claim source`,
        );
      }
    }
    if (
      row.evidence_strength_score !== claim.evidence_strength_score ||
      row.verdict_confidence_score !== claim.verdict_confidence_score ||
      row.confidence_band !== claim.confidence
    ) {
      evaluationProblems.push(
        `${row.record_id} / ${row.metric_name}: evidence scores or confidence do not match claims.csv`,
      );
    }
  }
  if (evaluationProblems.length > 0) {
    fail(
      `invalid evaluation audit rows:\n- ${evaluationProblems.join("\n- ")}`,
    );
  }

  const evidenceMetrics = {
    averageEvidenceStrength: averageNumericField(
      claims,
      "evidence_strength_score",
    ),
    averageVerdictConfidence: averageNumericField(
      claims,
      "verdict_confidence_score",
    ),
    rowsWithTwoSources: claims.filter(
      (claim) => Number(claim.evidence_source_count) >= 2,
    ).length,
    rowsWithTwoIndependentDomains: claims.filter(
      (claim) => Number(claim.independent_source_domain_count) >= 2,
    ).length,
    completeAuditClaims: claims.filter((claim) =>
      claim.evidence_audit_status.startsWith("Complete"),
    ).length,
  };
  const summaryChecks = [
    ["Average evidence strength", evidenceMetrics.averageEvidenceStrength],
    ["Average verdict confidence", evidenceMetrics.averageVerdictConfidence],
    ["Rows with at least two unique cited URLs", evidenceMetrics.rowsWithTwoSources],
    [
      "Rows with at least two independent source domains",
      evidenceMetrics.rowsWithTwoIndependentDomains,
    ],
    ["Rows with complete field-level audit", evidenceMetrics.completeAuditClaims],
  ];
  const evidenceAuditSummaryRows = summary.filter(
    (row) => row.section === "Evidence audit",
  );
  if (
    evidenceAuditSummaryRows.length > 0 &&
    evidenceAuditSummaryRows.length !== summaryChecks.length
  ) {
    fail(
      `summary Evidence audit must publish all ${summaryChecks.length} aggregate rows when the section is present.`,
    );
  }
  for (const [metric, expected] of summaryChecks) {
    const row = summary.find(
      (summaryRow) =>
        summaryRow.section === "Evidence audit" &&
        summaryRow.metric === metric &&
        summaryRow.group === "All",
    );
    if (!row && evidenceAuditSummaryRows.length === 0) continue;
    if (!row) fail(`summary is missing Evidence audit / ${metric} / All.`);
    if (metric.startsWith("Average")) {
      assertNumericField(
        row.percentage_or_score,
        expected,
        `summary Evidence audit / ${metric}`,
      );
    } else {
      assertNumericField(
        row.count,
        expected,
        `summary Evidence audit / ${metric} count`,
      );
      assertNumericField(
        row.total_records,
        claims.length,
        `summary Evidence audit / ${metric} total_records`,
      );
      assertNumericField(
        row.percentage_or_score,
        percentage(expected, claims.length),
        `summary Evidence audit / ${metric} percentage_or_score`,
      );
    }
  }

  return {
    auditMetricCount: expectedMetrics.length,
    evaluationAuditRecordCount: evaluationAudit.length,
    sourceAuditRecordCount: sourceAudit.length,
    ...evidenceMetrics,
  };
}

function normalizeMigrationRows(rows, schemaVersion) {
  const explicitSourceVersions = [
    ...new Set(
      rows
        .map((row) => row.old_schema_version)
        .filter((version) => version),
    ),
  ];
  const statusSourceVersions = [
    ...new Set(
      rows
        .map((row) => row.row_status?.match(/from v(\d+(?:\.\d+)*)/i)?.[1])
        .filter(Boolean),
    ),
  ].map((version) => (version.includes(".") ? version : `${version}.0`));
  const currentMajor = Number(schemaVersion.split(".")[0]);
  const headerSourceVersions = [
    ...new Set(
      Object.keys(rows[0] ?? {})
        .map((header) => header.match(/^v(\d+)_/)?.[1])
        .filter(
          (version) =>
            version !== undefined && Number(version) < currentMajor,
        ),
    ),
  ].map((version) => `${version}.0`);
  const sourceVersions =
    explicitSourceVersions.length > 0
      ? explicitSourceVersions
      : statusSourceVersions.length > 0
        ? statusSourceVersions
        : headerSourceVersions;
  if (sourceVersions.length !== 1) {
    fail(
      `migration must identify one prior schema version; found ${sourceVersions.join(", ") || "none"}.`,
    );
  }
  const [sourceSchemaVersion] = sourceVersions;
  const sourceMajor = sourceSchemaVersion.split(".")[0];
  const migration = rows.map((row) => {
    if (
      row.new_schema_version &&
      row.new_schema_version !== schemaVersion
    ) {
      fail(
        `migration new_schema_version must be ${schemaVersion}; found ${row.new_schema_version} for ${row.record_id}.`,
      );
    }
    const migratedFromPrior =
      Boolean(row.old_schema_version) ||
      /from v\d/i.test(row.row_status || "") ||
      Object.entries(row).some(
        ([field, value]) =>
          field.startsWith(`v${sourceMajor}_`) && value !== "",
      );
    return {
      ...row,
      old_schema_version:
        row.old_schema_version ||
        (migratedFromPrior ? sourceSchemaVersion : ""),
      new_schema_version: row.new_schema_version || schemaVersion,
      change_type: row.change_type || row.row_status || "Updated",
      change_note:
        row.change_note ||
        row.changes ||
        row.changes_and_evidence_reason ||
        "See the source-provided migration CSV for row-level history.",
    };
  });
  return { migration, sourceSchemaVersion };
}

export async function buildDataset({
  dataDir = defaultDataDir,
  generatedDir = defaultGeneratedDir,
  downloadDir = defaultDownloadDir,
  writeOutputs = true,
} = {}) {
  const dataEntries = await readdir(dataDir, { withFileTypes: true });
  const nonFiles = dataEntries
    .filter((entry) => !entry.name.startsWith(".") && !entry.isFile())
    .map((entry) => entry.name);
  if (nonFiles.length > 0) {
    fail(`data/ contains unexpected directories: ${nonFiles.join(", ")}.`);
  }

  const packageFiles = discoverDatasetPackage(
    dataEntries.filter((entry) => entry.isFile()).map((entry) => entry.name),
  );

  const readPackageFile = (role) =>
    readFile(path.join(dataDir, packageFiles[role].fileName), "utf8");
  const [
    claimsSource,
    summarySource,
    evaluationAuditSource,
    sourceAuditSource,
    classificationSource,
    migrationSource,
    methodology,
    datasetReadme,
  ] = await Promise.all([
    readPackageFile("claims"),
    readPackageFile("summary"),
    readPackageFile("evaluationAudit"),
    readPackageFile("sourceAudit"),
    readPackageFile("classificationKey"),
    readPackageFile("migration"),
    readPackageFile("methodology"),
    readPackageFile("datasetReadme"),
  ]);

  const claimsCsv = parseCsv(claimsSource, packageFiles.claims.fileName);
  const summaryCsv = parseCsv(summarySource, packageFiles.summary.fileName);
  const evaluationAuditCsv = parseCsv(
    evaluationAuditSource,
    packageFiles.evaluationAudit.fileName,
  );
  const sourceAuditCsv = parseCsv(
    sourceAuditSource,
    packageFiles.sourceAudit.fileName,
  );
  const classificationCsv = parseCsv(
    classificationSource,
    packageFiles.classificationKey.fileName,
  );
  const migrationCsv = parseCsv(
    migrationSource,
    packageFiles.migration.fileName,
  );

  requireHeaders(
    claimsCsv.headers,
    requiredClaimHeaders,
    packageFiles.claims.fileName,
  );
  requireHeaders(
    summaryCsv.headers,
    requiredSummaryHeaders,
    packageFiles.summary.fileName,
  );
  requireHeaders(
    evaluationAuditCsv.headers,
    requiredEvaluationAuditHeaders,
    packageFiles.evaluationAudit.fileName,
  );
  requireHeaders(
    sourceAuditCsv.headers,
    requiredSourceAuditHeaders,
    packageFiles.sourceAudit.fileName,
  );
  const hasCurrentClassificationShape = [
    "section",
    "key",
    "display_label",
    "score_or_value",
    "include_in_trust_score",
    "definition",
    "calculation_or_rule",
  ].every((header) => classificationCsv.headers.includes(header));
  const hasLegacyClassificationShape =
    ["score_points", "included_in_score", "definition"].every((header) =>
      classificationCsv.headers.includes(header),
    ) &&
    (classificationCsv.headers.includes("label") ||
      classificationCsv.headers.includes("classification"));
  if (
    !hasCurrentClassificationShape &&
    !hasLegacyClassificationShape
  ) {
    fail(
      `${packageFiles.classificationKey.fileName} does not match a supported classification-key schema.`,
    );
  }
  requireHeaders(
    migrationCsv.headers,
    ["record_id"],
    packageFiles.migration.fileName,
  );

  const claims = claimsCsv.records;
  const summary = summaryCsv.records;
  const evaluationAudit = evaluationAuditCsv.records;
  const sourceAudit = sourceAuditCsv.records;
  const classificationEntries = classificationCsv.records;
  const classificationKey = normalizeClassificationRows(
    classificationEntries,
  );
  const evidenceMetrics = normalizeEvidenceMetrics(classificationEntries);
  const expectedEvaluationMetricFields = Object.fromEntries(
    Object.entries(evaluationMetricFields).filter(([, claimField]) =>
      claimsCsv.headers.includes(claimField),
    ),
  );
  const migrationSourceRows = migrationCsv.records;

  if (claims.length === 0) fail("the claims CSV has no records.");
  if (classificationKey.length === 0) {
    fail("the classification key has no Primary verdict rows.");
  }

  const claimIds = claims.map((claim) => claim.record_id);
  if (claimIds.some((recordId) => recordId === "")) {
    fail("claim record IDs cannot be blank.");
  }
  if (new Set(claimIds).size !== claims.length) {
    fail("claim record IDs must be unique.");
  }

  const schemaVersions = new Set(claims.map((claim) => claim.schema_version));
  if (schemaVersions.size !== 1 || schemaVersions.has("")) {
    fail(
      `claims must share one nonblank schema_version; found ${[
        ...schemaVersions,
      ].join(", ")}.`,
    );
  }
  const schemaVersion = [...schemaVersions][0];
  const versionLabel = formatVersionLabel(schemaVersion);
  const schemaMajor = Number(schemaVersion.split(".")[0]);
  if (schemaMajor >= 5) {
    requireHeaders(
      claimsCsv.headers,
      strictPromiseClaimHeaders,
      packageFiles.claims.fileName,
    );
  }

  const evaluationDates = new Set(
    claims.map((claim) => claim.evaluation_date),
  );
  if (evaluationDates.size !== 1 || evaluationDates.has("")) {
    fail(
      `claims must share one nonblank evaluation_date; found ${[
        ...evaluationDates,
      ].join(", ")}.`,
    );
  }
  const evaluationDate = [...evaluationDates][0];
  if (!isValidIsoDate(evaluationDate)) {
    fail(
      `evaluation_date "${evaluationDate}" must use a valid YYYY-MM-DD date.`,
    );
  }
  const evaluationSchemaVersions = new Set(
    claims.map((claim) => claim.evaluation_schema_version),
  );
  if (
    evaluationSchemaVersions.size !== 1 ||
    evaluationSchemaVersions.has("")
  ) {
    fail(
      `claims must share one nonblank evaluation_schema_version; found ${[
        ...evaluationSchemaVersions,
      ].join(", ")}.`,
    );
  }
  const evaluationSchemaVersion = [...evaluationSchemaVersions][0];
  const { migration, sourceSchemaVersion } = normalizeMigrationRows(
    migrationSourceRows,
    schemaVersion,
  );
  const sourceVersionLabel = formatVersionLabel(sourceSchemaVersion);
  const migrationLabel = `${sourceVersionLabel} → ${versionLabel} source-package migration`;
  const normalizedDatasetReadme = datasetReadme.replaceAll("**", "");
  if (
    !normalizedDatasetReadme
      .toLowerCase()
      .includes(versionLabel.toLowerCase()) ||
    ![
      `Dataset version: ${schemaVersion}`,
      `Schema version: ${schemaVersion}`,
    ].some((marker) => normalizedDatasetReadme.includes(marker)) ||
    !normalizedDatasetReadme.includes(`Evaluation date: ${evaluationDate}`)
  ) {
    fail(
      `${packageFiles.datasetReadme.fileName} does not identify ${versionLabel} and evaluation date ${evaluationDate}.`,
    );
  }

  const classificationByName = new Map();
  for (const rule of classificationKey) {
    if (rule.classification === "") {
      fail("Primary verdict rows need nonblank labels.");
    }
    if (classificationByName.has(rule.classification)) {
      fail(`Primary verdict label "${rule.classification}" is duplicated.`);
    }
    if (!["Yes", "No"].includes(rule.included_in_score)) {
      fail(
        `Primary verdict "${rule.classification}" has invalid included_in_score "${rule.included_in_score}".`,
      );
    }
    if (
      rule.included_in_score === "Yes" &&
      (rule.score_points === "" || !Number.isFinite(Number(rule.score_points)))
    ) {
      fail(
        `scored Primary verdict "${rule.classification}" needs numeric score_points.`,
      );
    }
    if (
      rule.included_in_score === "No" &&
      rule.score_points !== ""
    ) {
      fail(
        `excluded Primary verdict "${rule.classification}" must have blank score_points.`,
      );
    }
    classificationByName.set(rule.classification, rule);
  }

  const maxScorePoints = Math.max(
    ...classificationKey
      .filter((rule) => rule.included_in_score === "Yes")
      .map((rule) => Number(rule.score_points)),
  );
  if (!Number.isFinite(maxScorePoints) || maxScorePoints <= 0) {
    fail("the classification key needs at least one positive scored verdict.");
  }

  const intentEntries = classificationEntries.filter((row) =>
    ["Intent status", "Intent"].includes(row.section),
  );
  const intentStatusAnswer = new Map(
    intentEntries.map((row) => [
      row.key,
      row.display_label ||
        (row.key === "Established"
          ? "Yes"
          : row.key === "Not assessable"
            ? "Not assessable"
            : "No"),
    ]),
  );
  const intentStatuses = new Set(intentStatusAnswer.keys());
  const intentEvidenceLevels = new Set(
    classificationEntries
      .filter((row) => row.section === "Intent evidence level")
      .map((row) => row.key),
  );
  const intentAnswers = new Set(intentStatusAnswer.values());
  const confidenceBands = classificationRanges(
    classificationEntries,
    "Confidence band",
  );
  const topicCategories = new Set(
    classificationEntries
      .filter((row) => row.section === "Public discourse category")
      .map((row) => row.key),
  );
  const invalidClaims = [];
  for (const claim of claims) {
    const rule = classificationByName.get(claim.verdict_category);
    const problems = [];
    const requiredValues = [
      "statement_date",
      "organization_or_domain",
      "primary_domain",
      "claim_type",
      "statement_paraphrase",
      "display_verdict",
      "classification_rationale",
      "outcome_summary",
      "confidence",
      "intentional_deception_established",
      "deception_intent_status",
      "deception_intent_evidence_level",
      "deception_intent_rationale",
      "statement_evidence_quality_score",
      "outcome_evidence_quality_score",
      "corroboration_score",
      "directness_score",
      "evidence_strength_score",
      "verdict_confidence_score",
      "evaluation_evidence_urls",
      "deadline_result_basis",
      "eventual_outcome_basis",
      "factual_accuracy_basis",
      "verdict_basis",
      "score_points_basis",
      "include_in_score_basis",
      "contestation_basis",
      "correction_basis",
      "repetition_basis",
      "confidence_basis",
      "evidence_audit_status",
      "evidence_last_reviewed",
    ];
    if (schemaMajor >= 5) {
      requiredValues.push(
        "status_rule_version",
        "strict_promise_result",
        "audit_disposition",
        "reviewed_against_strict_rule",
      );
    }
    const taxonomyFields = [
      "organization_or_domain",
      "primary_domain",
      "claim_type",
      "relationship_to_organization",
      "related_entity",
      "relationship_to_entity",
      "public_discourse_category",
    ];

    if (!rule) problems.push(`unknown verdict "${claim.verdict_category}"`);
    for (const field of requiredValues) {
      if (claim[field].trim() === "") problems.push(`missing ${field}`);
    }
    for (const field of taxonomyFields) {
      if (
        claim[field] !== undefined &&
        claim[field] !== claim[field].trim()
      ) {
        problems.push(`${field} cannot begin or end with whitespace`);
      }
    }
    if (
      !/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(claim.statement_date) &&
      claim.statement_date !== "Undated profile"
    ) {
      problems.push(`invalid statement_date "${claim.statement_date}"`);
    }
    if (!["Yes", "No"].includes(claim.include_in_trust_score)) {
      problems.push(
        `invalid include_in_trust_score "${claim.include_in_trust_score}"`,
      );
    }
    if (!/^https?:\/\//.test(claim.statement_source_url)) {
      problems.push("missing or invalid statement source URL");
    }
    if (!/^https?:\/\//.test(claim.outcome_source_1_url)) {
      problems.push("missing or invalid primary outcome source URL");
    }
    if (claim.statement_source_title === "") {
      problems.push("missing statement source title");
    }
    if (claim.outcome_source_1_title === "") {
      problems.push("missing primary outcome source title");
    }
    const outcomeSourceIndexes = Object.keys(claim)
      .map((field) => field.match(/^outcome_source_(\d+)_url$/)?.[1])
      .filter(Boolean);
    for (const index of outcomeSourceIndexes) {
      const url = claim[`outcome_source_${index}_url`];
      const title = claim[`outcome_source_${index}_title`];
      if (url && !/^https?:\/\//.test(url)) {
        problems.push(`invalid outcome source ${index} URL`);
      }
      if (url && !title) {
        problems.push(`outcome source ${index} is missing a title`);
      }
      if (!url && title) {
        problems.push(`outcome source ${index} has a title but no URL`);
      }
    }
    for (const [field, value] of [
      ["deception_intent_source_urls", claim.deception_intent_source_urls],
      ["evaluation_evidence_urls", claim.evaluation_evidence_urls],
    ]) {
      if (
        splitAuditValues(value).some(
          (url) => !/^https?:\/\//.test(url),
        )
      ) {
        problems.push(`${field} contains an invalid URL`);
      }
    }
    if (
      claim.evaluation_as_of !== evaluationDate ||
      claim.evidence_last_reviewed !== evaluationDate
    ) {
      problems.push(
        "evaluation_as_of and evidence_last_reviewed must match evaluation_date",
      );
    }
    if (
      claim.include_in_trust_score === "No" &&
      claim.intentional_deception_established !== "Not assessable"
    ) {
      problems.push("excluded claims must mark intent as Not assessable");
    }
    if (
      claim.include_in_trust_score === "Yes" &&
      claim.intentional_deception_established === "Not assessable"
    ) {
      problems.push("scored claims need a Yes or No intent answer");
    }
    if (
      !intentStatuses.has(claim.deception_intent_status) ||
      (intentEvidenceLevels.size > 0 &&
        !intentEvidenceLevels.has(claim.deception_intent_evidence_level)) ||
      !intentAnswers.has(claim.intentional_deception_established)
    ) {
      problems.push("intent fields do not match the published classification key");
    }
    if (
      topicCategories.size > 0 &&
      claim.public_discourse_category &&
      !topicCategories.has(claim.public_discourse_category)
    ) {
      problems.push(
        "public_discourse_category is absent from the classification key",
      );
    }
    const expectedIntentAnswer = intentStatusAnswer.get(
      claim.deception_intent_status,
    );
    if (claim.intentional_deception_established !== expectedIntentAnswer) {
      problems.push(
        "intentional_deception_established does not match deception_intent_status",
      );
    }
    const confidenceScore = Number(claim.verdict_confidence_score);
    const expectedConfidence = confidenceBands.find(
      (band) =>
        confidenceScore >= band.minimum &&
        confidenceScore <= band.maximum,
    )?.label;
    if (
      confidenceBands.length > 0 &&
      (!expectedConfidence || claim.confidence !== expectedConfidence)
    ) {
      problems.push(
        "confidence does not match the verdict_confidence_score band",
      );
    }

    if (schemaMajor >= 5) {
      if (claim.reviewed_against_strict_rule !== "Yes") {
        problems.push("reviewed_against_strict_rule must be Yes");
      }
      const isPromiseOrForecast = [
        "Promise or Commitment",
        "Prediction or Forecast",
      ].includes(claim.claim_type);
      if (!isPromiseOrForecast) {
        if (claim.strict_promise_result !== "Not applicable") {
          problems.push(
            "non-promise claims must use strict_promise_result = Not applicable",
          );
        }
      } else {
        const strictRule = {
          Pass: {
            verdict: "True",
            score: "100",
            included: "Yes",
          },
          Fail: {
            verdict: "False",
            score: "0",
            included: "Yes",
          },
          Pending: {
            verdict: "Pending",
            score: "",
            included: "No",
          },
          Unresolved: {
            verdict: "Unresolved",
            score: "",
            included: "No",
          },
        }[claim.strict_promise_result];
        if (!strictRule) {
          problems.push(
            `invalid strict_promise_result "${claim.strict_promise_result}"`,
          );
        } else if (
          claim.verdict_category !== strictRule.verdict ||
          claim.score_points !== strictRule.score ||
          claim.include_in_trust_score !== strictRule.included
        ) {
          problems.push(
            "promise/forecast verdict, score, or inclusion does not match strict_promise_result",
          );
        }
      }
    }

    if (rule) {
      if (claim.include_in_trust_score !== rule.included_in_score) {
        problems.push("inclusion does not match the classification key");
      }
      if (claim.score_points !== rule.score_points) {
        problems.push("score points do not match the classification key");
      }
      if (
        claim.include_in_trust_score === "No" &&
        claim.exclusion_reason === ""
      ) {
        problems.push("excluded claim has no exclusion reason");
      }
    }

    if (problems.length > 0) {
      invalidClaims.push(`${claim.record_id}: ${problems.join("; ")}`);
    }
  }
  if (invalidClaims.length > 0) {
    fail(`invalid claim rows:\n- ${invalidClaims.join("\n- ")}`);
  }
  const statusRuleVersions = new Set(
    claims.map((claim) => claim.status_rule_version).filter(Boolean),
  );
  if (
    schemaMajor >= 5 &&
    (statusRuleVersions.size !== 1 || statusRuleVersions.has(""))
  ) {
    fail(
      `claims must share one nonblank status_rule_version; found ${[
        ...statusRuleVersions,
      ].join(", ") || "none"}.`,
    );
  }

  if (migration.length !== claims.length) {
    fail(
      `migration must contain one row per current claim; found ${migration.length} for ${claims.length} claims.`,
    );
  }
  const migrationIds = migration.map((row) => row.record_id);
  if (
    new Set(migrationIds).size !== migration.length ||
    claimIds.some((recordId) => !migrationIds.includes(recordId))
  ) {
    fail("migration record IDs must match current claim IDs exactly once.");
  }
  const migrationSchemaVersions = new Set(
    migration.map((row) => row.new_schema_version),
  );
  if (
    migrationSchemaVersions.size !== 1 ||
    !migrationSchemaVersions.has(schemaVersion)
  ) {
    fail(
      `migration new_schema_version must be ${schemaVersion} for every row.`,
    );
  }
  const sourceSchemaVersions = [
    ...new Set(
      migration
        .map((row) => row.old_schema_version)
        .filter((version) => version !== ""),
    ),
  ];
  if (sourceSchemaVersions.length !== 1) {
    fail(
      `migration must identify one prior old_schema_version; found ${
        sourceSchemaVersions.join(", ") || "none"
      }.`,
    );
  }
  if (sourceSchemaVersions[0] !== sourceSchemaVersion) {
    fail(
      `migration source version drifted: expected ${sourceSchemaVersion}, found ${sourceSchemaVersions[0]}.`,
    );
  }

  const scoredClaims = claims.filter(
    (claim) => claim.include_in_trust_score === "Yes",
  );
  const pointsEarned = scoredClaims.reduce(
    (total, claim) => total + Number(claim.score_points),
    0,
  );
  const pointsPossible = scoredClaims.length * maxScorePoints;
  const exactScore = percentage(pointsEarned, pointsPossible);
  if (exactScore === null) fail("the dataset has no scored claims.");
  const roundedScore = Math.round(
    (pointsEarned / pointsPossible) * 100,
  );

  const overallSummary = validateSummary({
    claims,
    summary,
    classificationKey,
    classificationEntries,
    scoredClaims,
    pointsEarned,
    pointsPossible,
    exactScore,
    roundedScore,
    maxScorePoints,
  });

  const auditMetrics = validateAudits({
    claims,
    summary,
    evidenceMetricDefinitions: evidenceMetrics,
    expectedEvaluationMetricFields,
    evaluationAudit,
    sourceAudit,
  });
  const normalizedMethodology = methodology.replaceAll("**", "");
  if (
    ![
      `Dataset version: ${schemaVersion}`,
      `Schema version: ${schemaVersion}`,
    ].some((marker) => normalizedMethodology.includes(marker)) ||
    !normalizedMethodology.includes(`Evaluation date: ${evaluationDate}`) ||
    !normalizedMethodology.includes(
      `Evidence audit schema: ${evaluationSchemaVersion}`,
    )
  ) {
    fail(
      `${packageFiles.methodology.fileName} does not identify schema ${schemaVersion}, evaluation date ${evaluationDate}, and evidence audit schema ${evaluationSchemaVersion}.`,
    );
  }

  const citationHeaders = claimsCsv.headers.filter((header) =>
    header.endsWith("_url"),
  );
  const citationUrls = claims.flatMap((claim) =>
    citationHeaders.map((header) => claim[header]).filter(Boolean),
  );
  const sourceFiles = { ...datasetFileNames };
  const downloads = [
    {
      role: "claims",
      label: "Row-level CSV",
      fileName: sourceFiles.claims,
    },
    {
      role: "summary",
      label: "Summary CSV",
      fileName: sourceFiles.summary,
    },
    {
      role: "evaluationAudit",
      label: "Field-level evaluation audit",
      fileName: sourceFiles.evaluationAudit,
    },
    {
      role: "sourceAudit",
      label: "Source and evidence-score audit",
      fileName: sourceFiles.sourceAudit,
    },
    {
      role: "methodology",
      label: "Full methodology",
      fileName: sourceFiles.methodology,
    },
    {
      role: "classificationKey",
      label: "Classification key",
      fileName: sourceFiles.classificationKey,
    },
    {
      role: "migration",
      label: migrationLabel,
      fileName: sourceFiles.migration,
    },
    {
      role: "datasetReadme",
      label: "Dataset package guide",
      fileName: sourceFiles.datasetReadme,
    },
  ].map((download) => ({
    ...download,
    href: `/downloads/${download.fileName}`,
  }));

  const dataset = {
    meta: {
      schemaVersion,
      sourceSchemaVersion,
      versionLabel,
      sourceVersionLabel,
      migrationLabel,
      evaluationDate,
      evaluationSchemaVersion,
      statusRuleVersion:
        statusRuleVersions.size === 1 ? [...statusRuleVersions][0] : null,
      fieldCount: claimsCsv.headers.length,
      totalRecords: claims.length,
      scoredClaims: scoredClaims.length,
      excludedClaims: claims.length - scoredClaims.length,
      pointsEarned,
      pointsPossible,
      maxScorePoints,
      exactScore,
      roundedScore,
      conclusion: overallSummary.conclusion,
      primaryVerdictCount: classificationKey.length,
      scoredVerdictCount: classificationKey.filter(
        (rule) => rule.included_in_score === "Yes",
      ).length,
      excludedVerdictCount: classificationKey.filter(
        (rule) => rule.included_in_score === "No",
      ).length,
      citationCount: citationUrls.length,
      uniqueSourceCount: new Set(citationUrls).size,
      undatedClaimCount: claims.filter(
        (claim) => !/^\d{4}/.test(claim.statement_date),
      ).length,
      subjectCategoryCount: new Set(
        claims.map((claim) => claim.primary_domain).filter(Boolean),
      ).size,
      organizationContextCount: new Set(
        claims.map((claim) => claim.organization_or_domain).filter(Boolean),
      ).size,
      topicCategoryClaimCount: claims.filter(
        (claim) => claim.public_discourse_category,
      ).length,
      topicCategoryCount: new Set(
        claims
          .map((claim) => claim.public_discourse_category)
          .filter(Boolean),
      ).size,
      intentAnswerCounts: Object.fromEntries(
        [...intentAnswers].map((answer) => [
          answer,
          claims.filter(
            (claim) =>
              claim.intentional_deception_established === answer,
          ).length,
        ]),
      ),
      intentAssessmentCounts: Object.fromEntries(
        [...intentStatuses].map((status) => [
          status,
          claims.filter(
            (claim) => claim.deception_intent_status === status,
          ).length,
        ]),
      ),
      ...auditMetrics,
      sourceFiles,
      downloads,
    },
    claims,
    summary,
    classificationKey,
    classificationEntries,
    evidenceMetrics,
    ratingBands: classificationRanges(
      classificationEntries,
      ["Trust rating band", "Rating band"],
    ),
    migration,
  };
  const evaluationAuditByClaim = Object.fromEntries(
    claims.map((claim) => [
      claim.record_id,
      evaluationAudit.filter(
        (row) => row.record_id === claim.record_id,
      ),
    ]),
  );
  const sourceAuditByClaim = Object.fromEntries(
    sourceAudit.map((row) => [row.record_id, row]),
  );

  if (writeOutputs) {
    await Promise.all([
      rm(generatedDir, { recursive: true, force: true }),
      rm(downloadDir, { recursive: true, force: true }),
    ]);
    await Promise.all([
      mkdir(generatedDir, { recursive: true }),
      mkdir(downloadDir, { recursive: true }),
    ]);
    await Promise.all([
      writeFile(
        path.join(generatedDir, "dataset.json"),
        `${JSON.stringify(dataset, null, 2)}\n`,
      ),
      writeFile(
        path.join(generatedDir, "evaluation-audit.json"),
        `${JSON.stringify(evaluationAuditByClaim, null, 2)}\n`,
      ),
      writeFile(
        path.join(generatedDir, "source-audit.json"),
        `${JSON.stringify(sourceAuditByClaim, null, 2)}\n`,
      ),
    ]);
    await Promise.all(
      Object.values(sourceFiles).map((fileName) =>
        copyFile(
          path.join(dataDir, fileName),
          path.join(downloadDir, fileName),
        ),
      ),
    );
  }

  return {
    ...dataset,
    evaluationAudit,
    sourceAudit,
  };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const dataset = await buildDataset();
  console.log(
    `Imported ${dataset.meta.versionLabel}: ${dataset.meta.totalRecords} claims, ${dataset.meta.scoredClaims} scored, ${dataset.meta.pointsEarned}/${dataset.meta.pointsPossible} points (${dataset.meta.exactScore}%).`,
  );
}
