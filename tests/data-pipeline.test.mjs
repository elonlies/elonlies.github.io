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

test("discovers the stable package without encoding a dataset version", () => {
  const result = discoverDatasetPackage(stablePackage);

  assert.equal(result.claims.fileName, "claims.csv");
  assert.equal(result.summary.fileName, "summary.csv");
  assert.equal(result.classificationKey.fileName, "classification-key.csv");
  assert.equal(result.methodology.fileName, "methodology.md");
  assert.equal(result.migration.fileName, "migration.csv");
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

test("rejects invalid taxonomy values and contradictory summary aliases", async (t) => {
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
  const firstClaimCategory =
    "Business & Technology,,Master plan,Promise or Commitment";
  assert.ok(claimsSource.includes(firstClaimCategory));

  await writeFile(
    claimsPath,
    claimsSource.replace(
      firstClaimCategory,
      "Business & Technology,Politics & Elections,Master plan,Promise or Commitment",
    ),
  );
  await assert.rejects(
    buildDataset({ dataDir, writeOutputs: false }),
    /public_discourse_category is only valid for Public discourse records/i,
  );

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
