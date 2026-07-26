import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../out/", import.meta.url);
const dataRoot = new URL("../data/", import.meta.url);

async function readOutput(relativePath) {
  return readFile(new URL(relativePath, outputRoot), "utf8");
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(new URL(relativePath, dataRoot), "utf8"));
}

test("exports the v2 homepage instead of a rendered README", async () => {
  const html = await readOutput("index.html");

  assert.match(html, /Elon Musk Trust Score/i);
  assert.match(
    html,
    />36<\/span><span class="score-hero__denominator">%<\/span>/,
  );
  assert.match(
    html,
    /title="Exact calculation: 2,950 \/ 8,300 points = 35\.5%"/,
  );
  assert.match(html, /Not Trustworthy/i);
  assert.match(html, /100[^<]*source-backed records/i);
  assert.match(html, /83[^<]*included in the score/i);
  assert.match(html, /v1[^<]*v2 migration/i);
  assert.doesNotMatch(html, /markdown-body|Jekyll|vinext/i);
});

test("exports score, visualizations, methodology, and every stable claim route", async () => {
  const [
    scoreHtml,
    visualizationsHtml,
    methodologyHtml,
    claimHtml,
    claimDirectories,
  ] =
    await Promise.all([
      readOutput("score/index.html"),
      readOutput("visualizations/index.html"),
      readOutput("methodology/index.html"),
      readOutput("claims/TESLA-001/index.html"),
      readdir(new URL("claims/", outputRoot), { withFileTypes: true }),
    ]);

  assert.match(scoreHtml, /Why Elon Musk scores/i);
  assert.match(scoreHtml, /36<!-- -->%/);
  assert.match(scoreHtml, /2,950/);
  assert.match(scoreHtml, /Recalculate the score yourself/i);
  assert.match(visualizationsHtml, /See the pattern, not just the headline/i);
  assert.match(visualizationsHtml, /Annual Trust Score/i);
  assert.match(visualizationsHtml, /False records per year/i);
  assert.match(visualizationsHtml, /2016–2020/);
  assert.match(visualizationsHtml, /30\.5/);
  assert.match(methodologyHtml, /Dataset v2/i);
  assert.match(methodologyHtml, /Five scored categories/i);
  assert.match(methodologyHtml, /v1-to-v2 changes/i);
  assert.match(claimHtml, /Build a high-end electric sports car/i);
  assert.match(claimHtml, /Canonical classification/i);
  assert.match(claimHtml, /v1[^<]*v2 audit/i);
  assert.equal(
    claimDirectories.filter((entry) => entry.isDirectory()).length,
    100,
  );
});

test("exports GitHub Pages metadata and the complete v2 package", async () => {
  const html = await readOutput("index.html");

  assert.match(html, /Elon Musk Trust Score: 36%/i);
  assert.match(html, /https:\/\/elonlies\.github\.io\/og\.png/i);
  await Promise.all([
    access(new URL(".nojekyll", outputRoot)),
    access(new URL("404.html", outputRoot)),
    access(new URL("og.png", outputRoot)),
    access(new URL("downloads/elon_musk_claims_verified_v2.csv", outputRoot)),
    access(new URL("downloads/elon_musk_claims_summary_v2.csv", outputRoot)),
    access(
      new URL(
        "downloads/elon_musk_claims_classification_key_v2.csv",
        outputRoot,
      ),
    ),
    access(
      new URL(
        "downloads/elon_musk_claims_migration_v1_to_v2.csv",
        outputRoot,
      ),
    ),
    access(new URL("downloads/elon_musk_claims_methodology_v2.md", outputRoot)),
  ]);
});

test("generated v2 data reconciles score, categories, and migration", async () => {
  const [claims, classificationKey, migration, summary] = await Promise.all([
    readJson("claims.json"),
    readJson("classification-key.json"),
    readJson("migration.json"),
    readJson("summary.json"),
  ]);

  assert.equal(claims.length, 100);
  assert.equal(new Set(claims.map((claim) => claim.record_id)).size, 100);
  assert.equal(classificationKey.length, 7);
  assert.equal(migration.length, 100);
  assert.deepEqual(
    new Set(migration.map((row) => row.record_id)),
    new Set(claims.map((claim) => claim.record_id)),
  );

  const included = claims.filter(
    (claim) => claim.include_in_trust_score === "Yes",
  );
  assert.equal(included.length, 83);

  const points = included.reduce(
    (total, claim) => total + Number(claim.score_points),
    0,
  );
  assert.equal(points, 2950);
  assert.equal(Number(((points / (included.length * 100)) * 100).toFixed(1)), 35.5);
  assert.equal(Math.round(points / included.length), 36);

  const overall = summary.find(
    (row) =>
      row.section === "Overall" && row.metric === "Elon Musk Trust Score",
  );
  assert.equal(overall?.points_earned, "2950");
  assert.equal(overall?.points_possible, "8300");
  assert.equal(overall?.percentage_or_score, "35.5");
  assert.equal(overall?.conclusion, "Not Trustworthy");

  assert.deepEqual(
    migration
      .filter((row) => row.inclusion_changed === "Yes")
      .map((row) => row.record_id),
    ["X-004", "X-011"],
  );
});
