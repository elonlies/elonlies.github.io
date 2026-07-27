import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";
import {
  datasetFileNames,
  formatVersionLabel,
} from "../scripts/import-data.mjs";

const outputRoot = new URL("../out/", import.meta.url);
const dataRoot = new URL("../data/", import.meta.url);
const generatedRoot = new URL("../generated-data/", import.meta.url);
const publicDownloadsRoot = new URL("../public/downloads/", import.meta.url);
const dataset = JSON.parse(
  await readFile(new URL("dataset.json", generatedRoot), "utf8"),
);
const evaluationAuditByClaim = JSON.parse(
  await readFile(new URL("evaluation-audit.json", generatedRoot), "utf8"),
);
const sourceAuditByClaim = JSON.parse(
  await readFile(new URL("source-audit.json", generatedRoot), "utf8"),
);
const {
  meta,
  claims,
  classificationKey,
  classificationEntries,
  evidenceMetrics,
  migration,
  ratingBands,
  summary,
} = dataset;
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

async function readOutput(relativePath) {
  return readFile(new URL(relativePath, outputRoot), "utf8");
}

function withoutReactComments(html) {
  return html.replaceAll(/<!--.*?-->/g, "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function encodeHtmlText(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
}

test("exports a data-derived homepage instead of a rendered README", async () => {
  const html = withoutReactComments(await readOutput("index.html"));
  const exactCalculation = `${meta.pointsEarned.toLocaleString("en-US")} / ${meta.pointsPossible.toLocaleString("en-US")} points = ${meta.exactScore}%`;

  assert.match(html, /Elon Musk Trust Score/i);
  assert.match(
    html,
    new RegExp(
      `<span>${meta.roundedScore}</span><span class="score-hero__denominator">%</span>`,
    ),
  );
  assert.match(
    html,
    new RegExp(`title="Exact calculation: ${escapeRegExp(exactCalculation)}"`),
  );
  assert.match(html, new RegExp(escapeRegExp(meta.conclusion), "i"));
  assert.match(
    html,
    new RegExp(`${meta.totalRecords}[^<]*stable records`, "i"),
  );
  assert.match(
    html,
    new RegExp(`${meta.scoredClaims}</strong><span>included in the score`, "i"),
  );
  assert.match(
    html,
    new RegExp(
      `${meta.subjectCategoryCount}</strong><span>subject categories`,
      "i",
    ),
  );
  assert.match(
    html,
    new RegExp(`${meta.citationCount}[^<]*citation placements`, "i"),
  );
  assert.match(html, new RegExp(escapeRegExp(meta.migrationLabel), "i"));
  assert.doesNotMatch(html, /markdown-body|Jekyll|vinext/i);
});

test("exports all data-driven pages and every stable claim route", async () => {
  const subjectClaim = claims.find((claim) => claim.primary_domain);
  const topicClaim = claims.find(
    (claim) =>
      claim.public_discourse_category &&
      claim.organization_or_domain !== "Public discourse",
  );
  const organizationContextClaim = claims.find(
    (claim) => claim.organization_or_domain,
  );
  assert.ok(subjectClaim, "expected a subject category in the current data");
  assert.ok(
    topicClaim,
    "expected a topic category outside the Public discourse context",
  );
  assert.ok(
    organizationContextClaim,
    "expected an organization or context in the current data",
  );
  const [
    scoreHtml,
    visualizationsHtml,
    methodologyHtml,
    claimHtml,
    topicClaimHtml,
    organizationContextClaimHtml,
    claimDirectories,
  ] = await Promise.all([
    readOutput("score/index.html"),
    readOutput("visualizations/index.html"),
    readOutput("methodology/index.html"),
    readOutput(`claims/${subjectClaim.record_id}/index.html`),
    readOutput(`claims/${topicClaim.record_id}/index.html`),
    readOutput(`claims/${organizationContextClaim.record_id}/index.html`),
    readdir(new URL("claims/", outputRoot), { withFileTypes: true }),
  ]).then((values) =>
    values.map((value) =>
      typeof value === "string" ? withoutReactComments(value) : value,
    ),
  );

  assert.match(
    scoreHtml,
    new RegExp(`Why Elon Musk scores ${meta.roundedScore}%`, "i"),
  );
  assert.match(
    scoreHtml,
    new RegExp(meta.pointsEarned.toLocaleString("en-US")),
  );
  assert.match(scoreHtml, /Recalculate the score yourself/i);
  assert.match(scoreHtml, /Score by subject category/i);
  assert.match(scoreHtml, /Topic category/i);
  assert.match(scoreHtml, /Organization or context/i);
  assert.match(scoreHtml, /intentional deception/i);
  assert.match(
    scoreHtml,
    /class="mobile-filter-toggle"[^>]*aria-expanded="false"[^>]*aria-controls="claim-filter-options"/i,
  );
  assert.match(scoreHtml, /id="claim-filter-options"/i);
  assert.match(
    scoreHtml,
    new RegExp(`Show ${meta.totalRecords} results`, "i"),
  );
  assert.match(scoreHtml, /does not mean (?:the )?(?:claim|statement) was true/i);
  assert.doesNotMatch(scoreHtml, /Score by organization/i);
  assert.match(visualizationsHtml, /See the pattern, not just the headline/i);
  assert.match(visualizationsHtml, /Annual Trust Score/i);
  assert.match(visualizationsHtml, /Score by subject category/i);
  assert.match(visualizationsHtml, /Score by claim type/i);
  assert.doesNotMatch(visualizationsHtml, /Score by organization/i);
  assert.match(
    visualizationsHtml,
    new RegExp(escapeRegExp(meta.versionLabel), "i"),
  );
  assert.match(methodologyHtml, new RegExp(`Dataset ${meta.versionLabel}`, "i"));
  assert.match(
    methodologyHtml,
    new RegExp(`${meta.scoredVerdictCount} scored categories`, "i"),
  );
  assert.match(
    methodologyHtml,
    new RegExp(escapeRegExp(meta.migrationLabel), "i"),
  );
  assert.match(methodologyHtml, /evidence strength/i);
  assert.match(methodologyHtml, /field-level (?:evaluation )?audit/i);
  assert.match(methodologyHtml, /Was intentional deception established/i);
  assert.match(methodologyHtml, /Topic categor/i);
  assert.match(
    methodologyHtml,
    new RegExp(escapeRegExp(datasetFileNames.evaluationAudit), "i"),
  );
  assert.match(
    methodologyHtml,
    new RegExp(escapeRegExp(datasetFileNames.sourceAudit), "i"),
  );
  assert.match(
    claimHtml,
    new RegExp(escapeRegExp(subjectClaim.statement_paraphrase)),
  );
  assert.match(
    claimHtml,
    new RegExp(`${escapeRegExp(meta.versionLabel)} classification rationale`, "i"),
  );
  assert.match(
    claimHtml,
    new RegExp(`${escapeRegExp(meta.migrationLabel)} audit`, "i"),
  );
  assert.match(claimHtml, /Subject category/i);
  assert.match(
    claimHtml,
    new RegExp(
      escapeRegExp(encodeHtmlText(subjectClaim.primary_domain)),
    ),
  );
  assert.match(topicClaimHtml, /Topic category/i);
  assert.match(
    topicClaimHtml,
    new RegExp(
      escapeRegExp(
        encodeHtmlText(topicClaim.public_discourse_category),
      ),
    ),
  );
  assert.match(organizationContextClaimHtml, /Organization or context/i);
  assert.match(
    organizationContextClaimHtml,
    new RegExp(
      escapeRegExp(
        encodeHtmlText(organizationContextClaim.organization_or_domain),
      ),
    ),
  );
  assert.match(topicClaimHtml, /Assertion mode/i);
  assert.match(claimHtml, /Was intentional deception established/i);
  assert.match(
    claimHtml,
    new RegExp(
      escapeRegExp(
        encodeHtmlText(subjectClaim.intentional_deception_established),
      ),
    ),
  );
  assert.match(claimHtml, /Evidence strength/i);
  assert.match(
    claimHtml,
    new RegExp(
      `${escapeRegExp(subjectClaim.evidence_strength_score)}[\\s\\S]{0,80}(?:\\/|of)[\\s\\S]{0,20}100`,
      "i",
    ),
  );
  assert.match(claimHtml, /Field-level (?:evaluation )?audit/i);
  assert.equal(
    claimDirectories.filter((entry) => entry.isDirectory()).length,
    meta.totalRecords,
  );
});

test("exports GitHub Pages metadata and only the current package", async () => {
  const html = await readOutput("index.html");
  const outputDownloads = (
    await readdir(new URL("downloads/", outputRoot))
  ).sort();
  const expectedDownloads = meta.downloads
    .map((download) => download.fileName)
    .sort();
  const expectedDownloadRoles = Object.keys(datasetFileNames).sort();

  assert.match(
    html,
    new RegExp(`Elon Musk Trust Score: ${meta.roundedScore}%`, "i"),
  );
  assert.match(html, /https:\/\/elonlies\.github\.io\/og\.png/i);
  assert.deepEqual(outputDownloads, expectedDownloads);
  assert.deepEqual(
    meta.downloads.map((download) => download.role).sort(),
    expectedDownloadRoles,
  );
  assert.ok(
    meta.downloads.some(
      (download) =>
        download.role === "evaluationAudit" &&
        download.fileName === datasetFileNames.evaluationAudit,
    ),
  );
  assert.ok(
    meta.downloads.some(
      (download) =>
        download.role === "sourceAudit" &&
        download.fileName === datasetFileNames.sourceAudit,
    ),
  );

  await Promise.all([
    access(new URL(".nojekyll", outputRoot)),
    access(new URL("404.html", outputRoot)),
    access(new URL("og.png", outputRoot)),
    ...meta.downloads.map((download) =>
      access(new URL(`downloads/${download.fileName}`, outputRoot)),
    ),
  ]);
});

test("generated data reconciles score, taxonomy, intent, audits, and migration", () => {
  assert.equal(claims.length, meta.totalRecords);
  assert.deepEqual(
    [...new Set(claims.map((claim) => claim.schema_version))],
    [meta.schemaVersion],
  );
  assert.deepEqual(
    [...new Set(claims.map((claim) => claim.evaluation_date))],
    [meta.evaluationDate],
  );
  assert.equal(meta.versionLabel, formatVersionLabel(meta.schemaVersion));
  assert.equal(
    new Set(claims.map((claim) => claim.record_id)).size,
    meta.totalRecords,
  );
  assert.equal(classificationKey.length, meta.primaryVerdictCount);
  assert.ok(classificationEntries.length > classificationKey.length);
  assert.ok(
    classificationEntries.some((row) =>
      ["Intent status", "Intent"].includes(row.section),
    ),
  );
  assert.ok(
    classificationEntries.some((row) => row.section === "Evidence metric"),
  );
  assert.ok(evidenceMetrics.length >= 5);
  assert.ok(ratingBands.length > 0);
  assert.equal(migration.length, meta.totalRecords);
  assert.deepEqual(
    new Set(migration.map((row) => row.record_id)),
    new Set(claims.map((claim) => claim.record_id)),
  );
  assert.deepEqual(
    [
      ...new Set(
        migration
          .map((row) => row.old_schema_version)
          .filter((version) => version !== ""),
      ),
    ],
    [meta.sourceSchemaVersion],
  );
  assert.deepEqual(
    [...new Set(migration.map((row) => row.new_schema_version))],
    [meta.schemaVersion],
  );

  const included = claims.filter(
    (claim) => claim.include_in_trust_score === "Yes",
  );
  assert.equal(included.length, meta.scoredClaims);

  const points = included.reduce(
    (total, claim) => total + Number(claim.score_points),
    0,
  );
  const exactScore = Number(
    (
      (points / (included.length * meta.maxScorePoints)) *
      100
    ).toFixed(1),
  );
  assert.equal(points, meta.pointsEarned);
  assert.equal(included.length * meta.maxScorePoints, meta.pointsPossible);
  assert.equal(exactScore, meta.exactScore);
  assert.equal(
    Math.round((points / meta.pointsPossible) * 100),
    meta.roundedScore,
  );

  const citationHeaders = Object.keys(claims[0]).filter((header) =>
    header.endsWith("_url"),
  );
  const citations = claims.flatMap((claim) =>
    citationHeaders.map((header) => claim[header]).filter(Boolean),
  );
  assert.equal(citations.length, meta.citationCount);
  assert.equal(new Set(citations).size, meta.uniqueSourceCount);

  const subjectCategories = new Set(
    claims.map((claim) => claim.primary_domain).filter(Boolean),
  );
  assert.ok(
    claims.every((claim) => Boolean(claim.primary_domain?.trim())),
    "every claim needs a universal subject category",
  );
  const organizationContexts = new Set(
    claims.map((claim) => claim.organization_or_domain).filter(Boolean),
  );
  const topicCategoryClaims = claims.filter(
    (claim) => claim.public_discourse_category,
  );
  assert.ok(
    topicCategoryClaims.some(
      (claim) => claim.organization_or_domain !== "Public discourse",
    ),
    "topic categories must not be limited to one organization context",
  );
  const topicCategories = new Set(
    topicCategoryClaims.map(
      (claim) => claim.public_discourse_category,
    ),
  );
  assert.equal(meta.subjectCategoryCount, subjectCategories.size);
  assert.equal(meta.organizationContextCount, organizationContexts.size);
  assert.equal(
    meta.topicCategoryClaimCount,
    topicCategoryClaims.length,
  );
  assert.equal(meta.topicCategoryCount, topicCategories.size);
  assert.equal(
    meta.undatedClaimCount,
    claims.filter((claim) => !/^\d{4}/.test(claim.statement_date)).length,
  );
  const subjectSummaryRows = summary.filter(
    (row) =>
      ["By subject category", "By primary domain", "Primary domain"].includes(
        row.section,
      ) &&
      row.metric === "Trust Score",
  );
  assert.equal(
    new Set(subjectSummaryRows.map((row) => row.section)).size,
    1,
    "publish exactly one subject-category summary section alias",
  );
  assert.equal(subjectSummaryRows.length, subjectCategories.size);
  assert.deepEqual(
    new Set(subjectSummaryRows.map((row) => row.group)),
    subjectCategories,
  );

  const overall = summary.find(
    (row) =>
      (row.section === "Overall" &&
        row.metric === "Elon Musk Trust Score") ||
      (row.section === "Headline" && row.metric === "Exact Trust Score"),
  );
  assert.equal(Number(overall?.points_earned), meta.pointsEarned);
  assert.equal(Number(overall?.points_possible), meta.pointsPossible);
  assert.equal(Number(overall?.percentage_or_score), meta.exactScore);
  assert.equal(overall?.conclusion, meta.conclusion);

  const intentAnswerRows = summary.filter(
    (row) =>
      row.section === "Intent answer" &&
        row.metric === "Was intentional deception established?" ||
      row.section === "Intentional deception" &&
        row.metric === "Was intentional deception established?",
  );
  assert.ok(intentAnswerRows.length > 0);
  const expectedIntentCounts = Object.fromEntries(
    intentAnswerRows.map((row) => [
      row.group,
      claims.filter(
        (claim) => claim.intentional_deception_established === row.group,
      ).length,
    ]),
  );
  assert.deepEqual(meta.intentAnswerCounts, expectedIntentCounts);
  assert.ok(
    claims.every((claim) => {
      const expected =
        claim.deception_intent_status === "Established"
          ? "Yes"
          : claim.deception_intent_status === "Not assessable"
            ? "Not assessable"
            : "No";
      return claim.intentional_deception_established === expected;
    }),
  );

  const strictClaims = claims.filter(
    (claim) => claim.strict_promise_result !== "Not applicable",
  );
  assert.ok(strictClaims.length > 0);
  assert.equal(meta.auditMetricCount, 12);
  assert.ok(
    strictClaims.every((claim) => {
      const expected = {
        Pass: ["True", "100", "Yes"],
        Fail: ["False", "0", "Yes"],
        Pending: ["Pending", "", "No"],
        Unresolved: ["Unresolved", "", "No"],
      }[claim.strict_promise_result];
      return (
        expected &&
        claim.verdict_category === expected[0] &&
        claim.score_points === expected[1] &&
        claim.include_in_trust_score === expected[2]
      );
    }),
    "strict promise outcomes must determine verdict, score, and inclusion",
  );

  const claimIds = new Set(claims.map((claim) => claim.record_id));
  assert.deepEqual(new Set(Object.keys(evaluationAuditByClaim)), claimIds);
  assert.deepEqual(new Set(Object.keys(sourceAuditByClaim)), claimIds);
  assert.equal(
    Object.values(evaluationAuditByClaim).reduce(
      (total, rows) => total + rows.length,
      0,
    ),
    meta.evaluationAuditRecordCount,
  );
  assert.equal(
    Object.keys(sourceAuditByClaim).length,
    meta.sourceAuditRecordCount,
  );
  assert.equal(meta.auditMetricCount, Object.keys(evaluationMetricFields).length);
  for (const claim of claims) {
    const auditRows = evaluationAuditByClaim[claim.record_id];
    assert.equal(auditRows.length, meta.auditMetricCount);
    assert.deepEqual(
      new Set(auditRows.map((row) => row.metric_name)),
      new Set(Object.keys(evaluationMetricFields)),
    );
    for (const row of auditRows) {
      const claimField = evaluationMetricFields[row.metric_name];
      assert.equal(row.metric_value, claim[claimField]);
      assert.equal(row.evidence_strength_score, claim.evidence_strength_score);
      assert.equal(
        row.verdict_confidence_score,
        claim.verdict_confidence_score,
      );
      assert.equal(row.confidence_band, claim.confidence);
    }
    const sourceAudit = sourceAuditByClaim[claim.record_id];
    assert.equal(
      sourceAudit.evidence_strength_score,
      claim.evidence_strength_score,
    );
    assert.equal(
      sourceAudit.verdict_confidence_score,
      claim.verdict_confidence_score,
    );
  }
});

test("data is one authoritative package and downloads are byte-identical", async () => {
  const dataFiles = (await readdir(dataRoot)).sort();
  const expectedFiles = Object.values(meta.sourceFiles).sort();
  assert.deepEqual(meta.sourceFiles, datasetFileNames);
  assert.deepEqual(dataFiles, expectedFiles);

  await Promise.all(
    expectedFiles.map(async (fileName) => {
      const [source, download] = await Promise.all([
        readFile(new URL(fileName, dataRoot)),
        readFile(new URL(fileName, publicDownloadsRoot)),
      ]);
      assert.deepEqual(download, source, `${fileName} download drifted`);
    }),
  );
});

test("field-level audit prose stays out of client JavaScript bundles", async () => {
  const chunksRoot = new URL("_next/static/chunks/", outputRoot);
  const chunkNames = (await readdir(chunksRoot)).filter((fileName) =>
    fileName.endsWith(".js"),
  );
  const chunkSources = await Promise.all(
    chunkNames.map((fileName) =>
      readFile(new URL(fileName, chunksRoot), "utf8"),
    ),
  );
  const auditSentinel = claims[0].deadline_result_basis.slice(0, 120);

  assert.ok(auditSentinel.length > 0);
  assert.ok(
    chunkSources.every((source) => !source.includes(auditSentinel)),
    "claim audit prose must remain server-rendered instead of joining the explorer bundle",
  );
});

test("audit URLs retain source titles that contain semicolons", async () => {
  const claim = claims.find(
    (item) =>
      item.outcome_source_1_url &&
      item.outcome_source_1_title?.includes(";"),
  );
  assert.ok(claim, "expected a source title containing a semicolon");

  const html = await readOutput(`claims/${claim.record_id}/index.html`);
  const linkWithTitle = new RegExp(
    `href="${escapeRegExp(claim.outcome_source_1_url)}"[\\s\\S]{0,180}${escapeRegExp(
      encodeHtmlText(claim.outcome_source_1_title),
    )}`,
  );
  assert.match(html, linkWithTitle);
});
