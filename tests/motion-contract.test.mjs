import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(
  new URL("../app/globals.css", import.meta.url),
  "utf8",
);

test("motion is progressive, restrained, and dependency-free", () => {
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\)/);
  assert.match(css, /@supports \(animation-timeline: view\(\)\)/);
  assert.match(css, /@keyframes motion-rise/);
  assert.match(css, /@keyframes motion-bar-grow/);
  assert.match(css, /@keyframes motion-line-draw/);
  assert.match(css, /transform:\s*scaleX\(0\)/);
  assert.match(css, /animation-timeline:\s*view\(block\)/);
  assert.doesNotMatch(css, /transition\s*:\s*all\b/i);
  assert.doesNotMatch(css, /animation-iteration-count\s*:\s*infinite/i);
});

test("reduced-motion mode cancels animation, delays, transitions, and smooth scroll", () => {
  const reducedMotion = css.slice(
    css.indexOf("@media (prefers-reduced-motion: reduce)"),
  );

  assert.match(reducedMotion, /scroll-behavior:\s*auto !important/);
  assert.match(reducedMotion, /transition:\s*none !important/);
  assert.match(reducedMotion, /animation:\s*none !important/);
  assert.match(reducedMotion, /animation-delay:\s*0s !important/);
});

