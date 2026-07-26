import assert from "node:assert/strict";
import test from "node:test";
import {
  discoverDatasetPackage,
  parseCsv,
} from "../scripts/import-data.mjs";

const completeV4Package = [
  "elon_musk_claims_verified_v4.csv",
  "elon_musk_claims_summary_v4.csv",
  "elon_musk_claims_classification_key_v4.csv",
  "elon_musk_claims_methodology_v4.md",
  "elon_musk_claims_migration_v3_to_v4.csv",
];

test("discovers a complete future package without code changes", () => {
  const result = discoverDatasetPackage(completeV4Package);

  assert.equal(result.fileVersion, "4");
  assert.equal(result.claims.fileName, "elon_musk_claims_verified_v4.csv");
  assert.equal(result.migration.sourceVersion, "3");
  assert.equal(result.migration.targetVersion, "4");
});

test("rejects missing, mixed, duplicate, and stray package files", () => {
  assert.throws(
    () => discoverDatasetPackage(completeV4Package.slice(0, -1)),
    /missing package files for: migration/i,
  );
  assert.throws(
    () =>
      discoverDatasetPackage(
        completeV4Package.map((fileName) =>
          fileName.includes("summary_v4")
            ? "elon_musk_claims_summary_v5.csv"
            : fileName,
        ),
      ),
    /mixed versions/i,
  );
  assert.throws(
    () =>
      discoverDatasetPackage([
        ...completeV4Package,
        "elon_musk_claims_verified_v3.csv",
      ]),
    /more than one claims file/i,
  );
  assert.throws(
    () => discoverDatasetPackage([...completeV4Package, "notes.txt"]),
    /unexpected files/i,
  );
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
