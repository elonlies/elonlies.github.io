import assert from "node:assert/strict";
import test from "node:test";
import {
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
