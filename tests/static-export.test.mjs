import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../out/", import.meta.url);

async function readOutput(relativePath) {
  return readFile(new URL(relativePath, outputRoot), "utf8");
}

test("exports the homepage instead of a rendered README", async () => {
  const html = await readOutput("index.html");

  assert.match(html, /Elon Musk Trust Score/i);
  assert.match(html, />33</);
  assert.match(html, /Not trustworthy/i);
  assert.match(html, /100[^<]*source-backed records/i);
  assert.match(html, /Row-level CSV/i);
  assert.doesNotMatch(html, /markdown-body|Jekyll|vinext/i);
});

test("exports score, methodology, and every claim route", async () => {
  const [scoreHtml, methodologyHtml, claimHtml, claimDirectories] =
    await Promise.all([
      readOutput("score/index.html"),
      readOutput("methodology/index.html"),
      readOutput("claims/TESLA-001/index.html"),
      readdir(new URL("claims/", outputRoot), { withFileTypes: true }),
    ]);

  assert.match(scoreHtml, /Why Elon Musk scores 33\/100/i);
  assert.match(scoreHtml, /Recalculate the score yourself/i);
  assert.match(scoreHtml, /TESLA-001/);
  assert.match(methodologyHtml, /How the Trust Score works/i);
  assert.match(claimHtml, /Build a high-end electric sports car/i);
  assert.match(claimHtml, /Primary outcome source/i);
  assert.equal(
    claimDirectories.filter((entry) => entry.isDirectory()).length,
    100,
  );
});

test("exports GitHub Pages metadata and public assets", async () => {
  const html = await readOutput("index.html");

  assert.match(html, /https:\/\/elonlies\.github\.io\/og\.png/i);
  await Promise.all([
    access(new URL(".nojekyll", outputRoot)),
    access(new URL("404.html", outputRoot)),
    access(new URL("og.png", outputRoot)),
    access(new URL("downloads/elon_musk_claims_verified_v1.csv", outputRoot)),
    access(new URL("downloads/elon_musk_claims_summary_v1.csv", outputRoot)),
    access(new URL("downloads/elon_musk_claims_methodology_v1.md", outputRoot)),
  ]);
});

test("generated data preserves headline invariants", async () => {
  const claims = JSON.parse(
    await readFile(new URL("../data/claims.json", import.meta.url), "utf8"),
  );

  assert.equal(claims.length, 100);
  assert.equal(new Set(claims.map((claim) => claim.record_id)).size, 100);

  const included = claims.filter(
    (claim) => claim.included_in_site_percentage === "Yes",
  );
  assert.equal(included.length, 81);

  const points = included.reduce(
    (total, claim) => total + Number(claim.weighted_reliability_score),
    0,
  );
  assert.equal(points, 26.5);
  assert.equal(Number(((points / included.length) * 100).toFixed(1)), 32.7);
});
