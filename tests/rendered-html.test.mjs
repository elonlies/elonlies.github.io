import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set(
    "test",
    `${process.pid}-${Date.now()}-${encodeURIComponent(pathname)}`,
  );
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: {
        accept: "text/html",
        host: "localhost",
        "x-forwarded-proto": "http",
      },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the headline score and scope", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Elon Musk Trust Score/i);
  assert.match(html, />33</);
  assert.match(html, /Not trustworthy/i);
  assert.match(html, /100[^<]*source-backed records/i);
  assert.match(html, /Row-level CSV/i);
  assert.doesNotMatch(html, /codex-preview|loading skeleton/i);
});

test("server-renders the score breakdown and complete evidence index", async () => {
  const response = await render("/score");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Why Elon Musk scores 33\/100/i);
  assert.match(html, /26\.5/);
  assert.match(html, /Recalculate the score yourself/i);
  assert.match(html, /Showing\s*<strong>100<\/strong>/i);
  assert.match(html, /of[^a-z0-9]*100[^a-z0-9]*claims/i);
  assert.match(html, /TESLA-001/);
  assert.match(html, /PUBLIC-010/);
});

test("server-renders a row-level evidence page with citations", async () => {
  const response = await render("/claims/TESLA-001");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /TESLA-001/);
  assert.match(html, /Build a high-end electric sports car/i);
  assert.match(html, /From statement to verdict/i);
  assert.match(html, /Original statement/i);
  assert.match(html, /Primary outcome source/i);
  assert.match(html, /Not established/i);
});

test("generated data preserves headline invariants", async () => {
  const claims = JSON.parse(
    await readFile(new URL("../data/claims.json", import.meta.url), "utf8"),
  );

  assert.equal(claims.length, 100);
  assert.equal(new Set(claims.map((claim) => claim.record_id)).size, 100);
  assert.equal(
    claims.filter((claim) => claim.included_in_site_percentage === "Yes").length,
    81,
  );

  const included = claims.filter(
    (claim) => claim.included_in_site_percentage === "Yes",
  );
  const points = included.reduce(
    (total, claim) => total + Number(claim.weighted_reliability_score),
    0,
  );
  assert.equal(points, 26.5);
  assert.equal(Number(((points / included.length) * 100).toFixed(1)), 32.7);

  for (const claim of claims) {
    assert.match(claim.statement_source_url, /^https?:\/\//);
    assert.match(claim.outcome_source_1_url, /^https?:\/\//);
  }
});
