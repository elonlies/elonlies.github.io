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
const { meta, claims, classificationKey, migration, summary } = dataset;

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
  const publicDiscourseClaim = claims.find(
    (claim) => claim.public_discourse_category,
  );
  const relatedEntityClaim = claims.find((claim) => claim.related_entity);
  assert.ok(subjectClaim, "expected a subject category in the current data");
  assert.ok(
    publicDiscourseClaim,
    "expected a public discourse topic in the current data",
  );
  assert.ok(
    relatedEntityClaim,
    "expected a related entity in the current data",
  );
  const [
    scoreHtml,
    visualizationsHtml,
    methodologyHtml,
    claimHtml,
    publicDiscourseClaimHtml,
    relatedEntityClaimHtml,
    claimDirectories,
  ] = await Promise.all([
    readOutput("score/index.html"),
    readOutput("visualizations/index.html"),
    readOutput("methodology/index.html"),
    readOutput(`claims/${subjectClaim.record_id}/index.html`),
    readOutput(`claims/${publicDiscourseClaim.record_id}/index.html`),
    readOutput(`claims/${relatedEntityClaim.record_id}/index.html`),
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
  assert.match(scoreHtml, /Public discourse topic/i);
  assert.match(scoreHtml, /Organization or entity/i);
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
  assert.match(publicDiscourseClaimHtml, /Public discourse topic/i);
  assert.match(
    publicDiscourseClaimHtml,
    new RegExp(
      escapeRegExp(
        encodeHtmlText(publicDiscourseClaim.public_discourse_category),
      ),
    ),
  );
  assert.match(relatedEntityClaimHtml, /Related entity/i);
  assert.match(
    relatedEntityClaimHtml,
    new RegExp(
      escapeRegExp(encodeHtmlText(relatedEntityClaim.related_entity)),
    ),
  );
  assert.match(publicDiscourseClaimHtml, /Assertion mode/i);
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

  assert.match(
    html,
    new RegExp(`Elon Musk Trust Score: ${meta.roundedScore}%`, "i"),
  );
  assert.match(html, /https:\/\/elonlies\.github\.io\/og\.png/i);
  assert.deepEqual(outputDownloads, expectedDownloads);

  await Promise.all([
    access(new URL(".nojekyll", outputRoot)),
    access(new URL("404.html", outputRoot)),
    access(new URL("og.png", outputRoot)),
    ...meta.downloads.map((download) =>
      access(new URL(`downloads/${download.fileName}`, outputRoot)),
    ),
  ]);
});

test("generated data reconciles score, categories, citations, and migration", () => {
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
  assert.equal(Math.round(exactScore), meta.roundedScore);

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
  const relatedEntities = new Set(
    claims.map((claim) => claim.related_entity).filter(Boolean),
  );
  const publicDiscourseClaims = claims.filter(
    (claim) => claim.public_discourse_category,
  );
  assert.ok(
    publicDiscourseClaims.every(
      (claim) => claim.organization_or_domain === "Public discourse",
    ),
    "public-discourse topics must stay scoped to Public discourse records",
  );
  const publicDiscourseCategories = new Set(
    publicDiscourseClaims.map(
      (claim) => claim.public_discourse_category,
    ),
  );
  assert.equal(meta.subjectCategoryCount, subjectCategories.size);
  assert.equal(meta.relatedEntityCount, relatedEntities.size);
  assert.equal(
    meta.publicDiscourseTopicClaimCount,
    publicDiscourseClaims.length,
  );
  assert.equal(
    meta.publicDiscourseCategoryCount,
    publicDiscourseCategories.size,
  );
  const subjectSummaryRows = summary.filter(
    (row) =>
      ["By subject category", "By primary domain"].includes(row.section) &&
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
      row.section === "Overall" && row.metric === "Elon Musk Trust Score",
  );
  assert.equal(Number(overall?.points_earned), meta.pointsEarned);
  assert.equal(Number(overall?.points_possible), meta.pointsPossible);
  assert.equal(Number(overall?.percentage_or_score), meta.exactScore);
  assert.equal(overall?.conclusion, meta.conclusion);
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
