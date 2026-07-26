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
  methodology: "methodology.md",
  classificationKey: "classification-key.csv",
  migration: "migration.csv",
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

const summaryGroupFields = {
  "By primary domain": "primary_domain",
  "By organization": "organization_or_domain",
  "By claim type": "claim_type",
  "By relationship to entity": "relationship_to_entity",
  "Public discourse category": "public_discourse_category",
};

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
      implementation_rule: row.implementation_rule || "",
    }));
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
      `data/ must contain only the five stable dataset files. Unexpected files: ${unexpectedFiles.join(", ")}.`,
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
  scoredClaims,
  pointsEarned,
  pointsPossible,
  exactScore,
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

  const overall = findSummary("Overall", "Elon Musk Trust Score");
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

  for (const rule of classificationKey) {
    const rows = claims.filter(
      (claim) => claim.verdict_category === rule.classification,
    );
    const summaryRow = findSummary(
      "Verdict distribution",
      "Claim count",
      rule.classification,
    );
    if (!summaryRow) {
      fail(
        `summary is missing Verdict distribution / Claim count / ${rule.classification}.`,
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
  }

  for (const [section, field] of Object.entries(summaryGroupFields)) {
    const sectionRows = summary.filter(
      (row) => row.section === section && row.metric === "Trust Score",
    );
    if (sectionRows.length === 0) continue;
    const expectedGroups = new Set(
      claims.map((claim) => claim[field]).filter(Boolean),
    );
    const publishedGroups = new Set(sectionRows.map((row) => row.group));
    const missingGroups = [...expectedGroups].filter(
      (group) => !publishedGroups.has(group),
    );
    if (missingGroups.length > 0) {
      fail(`${section} summary is missing groups: ${missingGroups.join(", ")}.`);
    }

    for (const row of sectionRows) {
      const groupClaims = claims.filter((claim) => claim[field] === row.group);
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
      assertNumericField(
        row.points_earned,
        groupScoredClaims.length === 0 ? null : groupPoints,
        `${section} / ${row.group} points_earned`,
      );
      assertNumericField(
        row.points_possible,
        groupScoredClaims.length === 0 ? null : groupPossible,
        `${section} / ${row.group} points_possible`,
      );
      assertNumericField(
        row.percentage_or_score,
        groupScore,
        `${section} / ${row.group} percentage_or_score`,
      );
    }
  }

  const ratingRows = summary
    .filter(
      (row) =>
        row.section === "Rating scale" && row.metric === "Trust Score band",
    )
    .map((row) => ({
      label: row.group,
      minimum: Number(row.formula_or_rule.match(/\d+(?:\.\d+)?/)?.[0]),
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
    classificationSource,
    migrationSource,
    methodology,
  ] = await Promise.all([
    readPackageFile("claims"),
    readPackageFile("summary"),
    readPackageFile("classificationKey"),
    readPackageFile("migration"),
    readPackageFile("methodology"),
  ]);

  const claimsCsv = parseCsv(claimsSource, packageFiles.claims.fileName);
  const summaryCsv = parseCsv(summarySource, packageFiles.summary.fileName);
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
    classificationCsv.headers,
    ["score_points", "included_in_score", "definition"],
    packageFiles.classificationKey.fileName,
  );
  if (
    !classificationCsv.headers.includes("label") &&
    !classificationCsv.headers.includes("classification")
  ) {
    fail(
      `${packageFiles.classificationKey.fileName} needs a label or classification column.`,
    );
  }
  requireHeaders(
    migrationCsv.headers,
    ["record_id", "old_schema_version", "new_schema_version"],
    packageFiles.migration.fileName,
  );

  const claims = claimsCsv.records;
  const summary = summaryCsv.records;
  const classificationEntries = classificationCsv.records;
  const classificationKey = normalizeClassificationRows(
    classificationEntries,
  );
  const migration = migrationCsv.records;

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
    ];

    if (!rule) problems.push(`unknown verdict "${claim.verdict_category}"`);
    for (const field of requiredValues) {
      if (claim[field] === "") problems.push(`missing ${field}`);
    }
    if (!/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(claim.statement_date)) {
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
  const sourceSchemaVersion = sourceSchemaVersions[0];
  const sourceVersionLabel = formatVersionLabel(sourceSchemaVersion);
  const migrationLabel = `${sourceVersionLabel} → ${versionLabel} migration`;

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

  const overallSummary = validateSummary({
    claims,
    summary,
    classificationKey,
    scoredClaims,
    pointsEarned,
    pointsPossible,
    exactScore,
    maxScorePoints,
  });

  if (
    !methodology.includes(`Dataset version:** ${schemaVersion}`) ||
    !methodology.includes(`Evaluation date:** ${evaluationDate}`)
  ) {
    fail(
      `${packageFiles.methodology.fileName} does not identify schema ${schemaVersion} and evaluation date ${evaluationDate}.`,
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
      fieldCount: claimsCsv.headers.length,
      totalRecords: claims.length,
      scoredClaims: scoredClaims.length,
      excludedClaims: claims.length - scoredClaims.length,
      pointsEarned,
      pointsPossible,
      maxScorePoints,
      exactScore,
      roundedScore: Math.round(exactScore),
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
      sourceFiles,
      downloads,
    },
    claims,
    summary,
    classificationKey,
    classificationEntries,
    migration,
  };

  if (writeOutputs) {
    await Promise.all([
      rm(generatedDir, { recursive: true, force: true }),
      rm(downloadDir, { recursive: true, force: true }),
    ]);
    await Promise.all([
      mkdir(generatedDir, { recursive: true }),
      mkdir(downloadDir, { recursive: true }),
    ]);
    await writeFile(
      path.join(generatedDir, "dataset.json"),
      `${JSON.stringify(dataset, null, 2)}\n`,
    );
    await Promise.all(
      Object.values(sourceFiles).map((fileName) =>
        copyFile(
          path.join(dataDir, fileName),
          path.join(downloadDir, fileName),
        ),
      ),
    );
  }

  return dataset;
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
