import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [css, explorerSource] = await Promise.all([
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  readFile(
    new URL("../components/ClaimsExplorer.tsx", import.meta.url),
    "utf8",
  ),
]);

const mobileStart = css.indexOf("@media (max-width: 760px)");
const mobileEnd = css.indexOf("@media (max-width: 480px)", mobileStart);
const desktopCss = css.slice(0, mobileStart);
const mobileCss = css.slice(mobileStart, mobileEnd);

test("mobile evidence filters collapse without changing the desktop panel", () => {
  assert.match(
    desktopCss,
    /\.claims-filters\s*\{[^}]*position:\s*sticky/s,
  );
  assert.match(
    mobileCss,
    /\.claims-filters\s*\{[^}]*position:\s*static/s,
  );
  assert.match(mobileCss, /\.filter-grid\s*\{[^}]*display:\s*none/s);
  assert.match(
    mobileCss,
    /\.claims-filters--open \.filter-grid\s*\{[^}]*display:\s*grid/s,
  );
});

test("mobile filter disclosure is accessible and returns users to results", () => {
  assert.match(explorerSource, /aria-expanded=\{filtersOpen\}/);
  assert.match(explorerSource, /aria-controls="claim-filter-options"/);
  assert.match(explorerSource, /id="claim-filter-options"/);
  assert.match(explorerSource, /scrollIntoView\(/);
  assert.match(
    explorerSource,
    /prefers-reduced-motion:\s*reduce/,
  );
});
