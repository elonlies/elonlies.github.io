import assert from "node:assert/strict";
import {
  cp,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  buildDataset,
  datasetFileNames,
  discoverDatasetPackage,
  formatVersionLabel,
  parseCsv,
} from "../scripts/import-data.mjs";

const stablePackage = Object.values(datasetFileNames);
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
});

test("discovers the stable package without encoding a dataset version", () => {
  const result = discoverDatasetPackage(stablePackage);

  assert.deepEqual(Object.keys(datasetFileNames), [
    "claims",
    "summary",
    "evaluationAudit",
    "sourceAudit",
    "methodology",
    "classificationKey",
    "migration",
    "datasetReadme",
  ]);
  assert.equal(stablePackage.length, 8);
  assert.equal(result.claims.fileName, "claims.csv");
  assert.equal(result.summary.fileName, "summary.csv");
  assert.equal(result.evaluationAudit.fileName, "evaluation-audit.csv");
  assert.equal(result.sourceAudit.fileName, "source-audit.csv");
  assert.equal(result.classificationKey.fileName, "classification-key.csv");
  assert.equal(result.methodology.fileName, "methodology.md");
  assert.equal(result.migration.fileName, "migration.csv");
  assert.equal(result.datasetReadme.fileName, "dataset-readme.md");
});

test("rejects missing, duplicate, legacy-versioned, and stray package files", () => {
  assert.throws(
    () =>
      discoverDatasetPackage(
        stablePackage.filter((fileName) => fileName !== "migration.csv"),
      ),
    /missing required files: migration\.csv/i,
  );
  assert.throws(
    () =>
      discoverDatasetPackage([
        ...stablePackage,
        "elon_musk_claims_verified_v3.csv",
      ]),
    /unexpected files/i,
  );
  assert.throws(
    () => discoverDatasetPackage([...stablePackage, "claims.csv"]),
    /filenames must be unique/i,
  );
  assert.throws(
    () => discoverDatasetPackage([...stablePackage, "notes.txt"]),
    /unexpected files/i,
  );
});

test("formats content-derived schema versions for display", () => {
  assert.equal(formatVersionLabel("3.0"), "v3");
  assert.equal(formatVersionLabel("4.1"), "v4.1");
  assert.equal(formatVersionLabel("5.2.0"), "v5.2");
  assert.throws(() => formatVersionLabel("v6"), /dot-separated/i);
});

test("CSV parsing is BOM-aware, quote-aware, and shape-validating", () => {
  const parsed = parseCsv(
    '\uFEFFid,note\nA-1,"Contains, comma"\nA-2,"Escaped ""quote"""\n',
    "sample.csv",
  );

  assert.deepEqual(parsed.headers, ["id", "note"]);
  assert.deepEqual(parsed.records, [
    { id: "A-1", note: "Contains, comma" },
    { id: "A-2", note: 'Escaped "quote"' },
  ]);
  assert.throws(
    () => parseCsv("id,note\nA-1\n", "bad.csv"),
    /row 2 has 1 fields; expected 2/i,
  );
  assert.throws(
    () => parseCsv('id,note\nA-1,"unfinished\n', "bad.csv"),
    /ends inside a quoted field/i,
  );
});

test("accepts cross-context topic categories and rejects invalid taxonomy or duplicate aliases", async (t) => {
  const temporaryRoot = await mkdtemp(
    path.join(tmpdir(), "elonlies-taxonomy-"),
  );
  const dataDir = path.join(temporaryRoot, "data");
  await cp(new URL("../data/", import.meta.url), dataDir, {
    recursive: true,
  });
  t.after(() => rm(temporaryRoot, { recursive: true, force: true }));

  const claimsPath = path.join(dataDir, datasetFileNames.claims);
  const summaryPath = path.join(dataDir, datasetFileNames.summary);
  const claimsSource = await readFile(claimsPath, "utf8");
  const baseline = await buildDataset({ dataDir, writeOutputs: false });
  const crossContextTopicClaim = baseline.claims.find(
    (claim) =>
      claim.public_discourse_category &&
      claim.organization_or_domain !== "Public discourse",
  );
  assert.ok(
    crossContextTopicClaim,
    "topic categories must be usable outside a single organization context",
  );
  assert.ok(
    baseline.classificationEntries.some(
      (row) =>
        row.section === "Public discourse category" &&
        row.key === crossContextTopicClaim.public_discourse_category,
    ),
    "the cross-context topic must be declared in classification-key.csv",
  );

  const firstClaimCategory =
    "Business & Technology,,Master plan,Promise or Commitment";
  assert.ok(claimsSource.includes(firstClaimCategory));

  await writeFile(
    claimsPath,
    claimsSource.replace(
      firstClaimCategory,
      "   ,,Master plan,Promise or Commitment",
    ),
  );
  await assert.rejects(
    buildDataset({ dataDir, writeOutputs: false }),
    /missing primary_domain/i,
  );

  await writeFile(claimsPath, claimsSource);
  const summarySource = await readFile(summaryPath, "utf8");
  const duplicateAliasRows = summarySource
    .split(/\r?\n/)
    .filter((row) => row.startsWith("By primary domain,Trust Score,"))
    .map((row) => row.replace("By primary domain", "By subject category"));
  assert.ok(duplicateAliasRows.length > 0);
  await writeFile(
    summaryPath,
    `${summarySource.trimEnd()}\n${duplicateAliasRows.join("\n")}\n`,
  );
  await assert.rejects(
    buildDataset({ dataDir, writeOutputs: false }),
    /multiple aliases for the same grouping/i,
  );
});

test("reconciles intent answers and every V4 audit row to claims.csv", async () => {
  const {
    claims,
    summary,
    evaluationAudit,
    sourceAudit,
    meta,
  } = await buildDataset({ writeOutputs: false });
  const claimById = new Map(
    claims.map((claim) => [claim.record_id, claim]),
  );

  const publishedIntentAnswers = summary
    .filter((row) => row.section === "Intent answer")
    .map((row) => row.group);
  const expectedIntentCounts = Object.fromEntries(
    publishedIntentAnswers.map((answer) => [
      answer,
      claims.filter(
        (claim) => claim.intentional_deception_established === answer,
      ).length,
    ]),
  );
  assert.deepEqual(meta.intentAnswerCounts, expectedIntentCounts);
  assert.ok(
    claims.every((claim) => {
      const expectedAnswer =
        claim.deception_intent_status === "Established"
          ? "Yes"
          : claim.deception_intent_status === "Not assessable"
            ? "Not assessable"
            : "No";
      return claim.intentional_deception_established === expectedAnswer;
    }),
    "the public intent answer must follow the detailed intent assessment",
  );
  assert.ok(
    claims.every(
      (claim) =>
        claim.include_in_trust_score === "Yes" ||
        claim.intentional_deception_established === "Not assessable",
    ),
    "unscored claims must not receive a definitive intent answer",
  );

  const metricNames = Object.keys(evaluationMetricFields);
  assert.equal(meta.auditMetricCount, metricNames.length);
  assert.equal(
    evaluationAudit.length,
    claims.length * metricNames.length,
  );
  assert.equal(meta.evaluationAuditRecordCount, evaluationAudit.length);
  assert.equal(sourceAudit.length, claims.length);
  assert.equal(meta.sourceAuditRecordCount, sourceAudit.length);
  assert.equal(
    new Set(
      evaluationAudit.map(
        (row) => `${row.record_id}\u0000${row.metric_name}`,
      ),
    ).size,
    evaluationAudit.length,
    "each claim/metric audit key must be unique",
  );

  for (const row of evaluationAudit) {
    const claim = claimById.get(row.record_id);
    const claimField = evaluationMetricFields[row.metric_name];
    assert.ok(claim, `unknown evaluation-audit claim ${row.record_id}`);
    assert.ok(
      claimField,
      `unknown evaluation-audit metric ${row.metric_name}`,
    );
    assert.equal(row.metric_value, claim[claimField]);
    assert.equal(row.evidence_strength_score, claim.evidence_strength_score);
    assert.equal(
      row.verdict_confidence_score,
      claim.verdict_confidence_score,
    );
    assert.equal(row.confidence_band, claim.confidence);
  }

  assert.deepEqual(
    new Set(sourceAudit.map((row) => row.record_id)),
    new Set(claims.map((claim) => claim.record_id)),
  );
  for (const row of sourceAudit) {
    const claim = claimById.get(row.record_id);
    assert.ok(claim, `unknown source-audit claim ${row.record_id}`);
    for (const field of [
      "statement_source_url",
      "outcome_source_1_url",
      "evidence_strength_score",
      "verdict_confidence_score",
      "evidence_source_count",
      "independent_source_domain_count",
    ]) {
      assert.equal(row[field], claim[field], `${row.record_id} ${field}`);
    }
  }
});
