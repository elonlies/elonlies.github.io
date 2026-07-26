import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "source-data");
const outputDir = path.join(root, "data");
const downloadDir = path.join(root, "public", "downloads");

function parseCsv(source) {
  const text = source.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  const [headers, ...records] = rows;
  if (!headers) return [];

  return records.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])),
  );
}

async function readCsv(fileName) {
  const source = await readFile(path.join(sourceDir, fileName), "utf8");
  return parseCsv(source);
}

const claims = await readCsv("elon_musk_claims_verified_v1.csv");
const summary = await readCsv("elon_musk_claims_summary_v1.csv");

if (claims.length !== 100) {
  throw new Error(`Expected 100 claim records, found ${claims.length}.`);
}

if (new Set(claims.map((claim) => claim.record_id)).size !== claims.length) {
  throw new Error("Claim record IDs must be unique.");
}

const invalidClaims = claims.filter(
  (claim) =>
    !claim.statement_source_url.startsWith("http") ||
    !claim.outcome_source_1_url.startsWith("http"),
);

if (invalidClaims.length > 0) {
  throw new Error(
    `Every claim must include statement and outcome citations. Invalid records: ${invalidClaims
      .map((claim) => claim.record_id)
      .join(", ")}`,
  );
}

await Promise.all([
  mkdir(outputDir, { recursive: true }),
  mkdir(downloadDir, { recursive: true }),
]);
await Promise.all([
  writeFile(path.join(outputDir, "claims.json"), `${JSON.stringify(claims, null, 2)}\n`),
  writeFile(path.join(outputDir, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`),
  copyFile(
    path.join(sourceDir, "elon_musk_claims_verified_v1.csv"),
    path.join(downloadDir, "elon_musk_claims_verified_v1.csv"),
  ),
  copyFile(
    path.join(sourceDir, "elon_musk_claims_summary_v1.csv"),
    path.join(downloadDir, "elon_musk_claims_summary_v1.csv"),
  ),
  copyFile(
    path.join(sourceDir, "elon_musk_claims_methodology_v1.md"),
    path.join(downloadDir, "elon_musk_claims_methodology_v1.md"),
  ),
]);

console.log(
  `Imported ${claims.length} claims and ${summary.length} summary rows from source-data/.`,
);
