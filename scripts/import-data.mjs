import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "data");
const downloadDir = path.join(root, "public", "downloads");
const sourceFiles = {
  claims: "elon_musk_claims_verified_v2.csv",
  summary: "elon_musk_claims_summary_v2.csv",
  methodology: "elon_musk_claims_methodology_v2.md",
  classificationKey: "elon_musk_claims_classification_key_v2.csv",
  migration: "elon_musk_claims_migration_v1_to_v2.csv",
};

function parseCsv(source) {
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

  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  const [headers, ...records] = rows;
  if (!headers) return [];

  return records.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])),
  );
}

async function readCsv(fileName) {
  const source = await readFile(path.join(dataDir, fileName), "utf8");
  return parseCsv(source);
}

const [claims, summary, classificationKey, migration] = await Promise.all([
  readCsv(sourceFiles.claims),
  readCsv(sourceFiles.summary),
  readCsv(sourceFiles.classificationKey),
  readCsv(sourceFiles.migration),
]);

if (claims.length !== 100) {
  throw new Error(`Expected 100 claim records, found ${claims.length}.`);
}

const claimIds = new Set(claims.map((claim) => claim.record_id));
if (claimIds.size !== claims.length) {
  throw new Error("Claim record IDs must be unique.");
}

if (migration.length !== claims.length) {
  throw new Error(
    `Expected ${claims.length} migration rows, found ${migration.length}.`,
  );
}

const migrationIds = new Set(migration.map((row) => row.record_id));
const migrationMismatch = [...claimIds].filter(
  (recordId) => !migrationIds.has(recordId),
);
if (migrationIds.size !== claims.length || migrationMismatch.length > 0) {
  throw new Error(
    "The migration map must contain every claim record ID exactly once.",
  );
}

const classificationByName = new Map(
  classificationKey.map((row) => [row.classification, row]),
);
const expectedClassifications = [
  "True",
  "Mostly True",
  "Misleading",
  "Unsupported",
  "False",
  "Unresolved",
  "Pending",
];
const missingClassifications = expectedClassifications.filter(
  (classification) => !classificationByName.has(classification),
);
if (
  classificationByName.size !== expectedClassifications.length ||
  missingClassifications.length > 0
) {
  throw new Error(
    `Classification key is incomplete. Missing: ${missingClassifications.join(", ") || "unknown extra or duplicate rows"}.`,
  );
}

const invalidClaims = claims.filter(
  (claim) =>
    claim.schema_version !== "2.0" ||
    !claim.statement_source_url.startsWith("http") ||
    !claim.outcome_source_1_url.startsWith("http"),
);

if (invalidClaims.length > 0) {
  throw new Error(
    `Every claim must include statement and outcome citations. Invalid records: ${invalidClaims
      .map((claim) => claim.record_id)
      .join(", ")}`,
  );
}

const inconsistentClaims = claims.filter((claim) => {
  const classification = classificationByName.get(claim.verdict_category);
  if (!classification) return true;
  return (
    claim.include_in_trust_score !== classification.included_in_score ||
    claim.score_points !== classification.score_points ||
    (claim.include_in_trust_score === "No" && claim.exclusion_reason === "")
  );
});

if (inconsistentClaims.length > 0) {
  throw new Error(
    `Claim scoring does not match the v2 classification key: ${inconsistentClaims
      .map((claim) => claim.record_id)
      .join(", ")}`,
  );
}

const scoredClaims = claims.filter(
  (claim) => claim.include_in_trust_score === "Yes",
);
const pointsEarned = scoredClaims.reduce(
  (total, claim) => total + Number(claim.score_points),
  0,
);
const pointsPossible = scoredClaims.length * 100;
const trustScore = Number(((pointsEarned / pointsPossible) * 100).toFixed(1));
const overallSummary = summary.find(
  (row) =>
    row.section === "Overall" && row.metric === "Elon Musk Trust Score",
);

if (
  !overallSummary ||
  Number(overallSummary.count) !== scoredClaims.length ||
  Number(overallSummary.points_earned) !== pointsEarned ||
  Number(overallSummary.points_possible) !== pointsPossible ||
  Number(overallSummary.percentage_or_score) !== trustScore
) {
  throw new Error(
    "The v2 summary Trust Score does not reconcile to the claims CSV.",
  );
}

await Promise.all([
  mkdir(dataDir, { recursive: true }),
  mkdir(downloadDir, { recursive: true }),
]);
await Promise.all([
  writeFile(
    path.join(dataDir, "claims.json"),
    `${JSON.stringify(claims, null, 2)}\n`,
  ),
  writeFile(
    path.join(dataDir, "summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
  ),
  writeFile(
    path.join(dataDir, "classification-key.json"),
    `${JSON.stringify(classificationKey, null, 2)}\n`,
  ),
  writeFile(
    path.join(dataDir, "migration.json"),
    `${JSON.stringify(migration, null, 2)}\n`,
  ),
  ...Object.values(sourceFiles).map((fileName) =>
    copyFile(path.join(dataDir, fileName), path.join(downloadDir, fileName)),
  ),
]);

console.log(
  `Imported v2: ${claims.length} claims, ${scoredClaims.length} scored, ${pointsEarned}/${pointsPossible} points (${trustScore}%).`,
);
