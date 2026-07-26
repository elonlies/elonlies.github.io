import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, "public", "og.png");
const dataset = JSON.parse(
  await readFile(path.join(root, "generated-data", "dataset.json"), "utf8"),
);
const { meta } = dataset;
const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
const evaluationDate = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})
  .format(new Date(`${meta.evaluationDate}T00:00:00Z`))
  .toUpperCase();

const card = String.raw`
  <svg width="1731" height="909" viewBox="0 0 1731 909" xmlns="http://www.w3.org/2000/svg">
    <rect width="1731" height="909" fill="#f3eee3"/>
    <g fill="#151714" font-family="DejaVu Sans, Arial, sans-serif">
      <text x="55" y="116" font-size="68" font-weight="800" letter-spacing="-1">
        ELON MUSK / TRUST RECORD
      </text>
      <rect x="55" y="153" width="1621" height="3" fill="#151714"/>

      <text x="57" y="253" fill="#4c514b" font-size="51" font-weight="700" letter-spacing="4">
        TRUST SCORE
      </text>
      <text x="42" y="654" font-size="440" font-weight="800" letter-spacing="-24">
        ${meta.roundedScore}
      </text>
      <text x="620" y="654" font-size="250" font-weight="700">
        %
      </text>

      <rect x="56" y="674" width="1049" height="6" fill="#b9342b"/>
      <text x="52" y="808" fill="#b9342b" font-size="82" font-weight="800" letter-spacing="2">
        ${escapeXml(meta.conclusion.toUpperCase())}
      </text>

      <rect x="1160" y="186" width="2" height="642" fill="#242720"/>
      <text x="1210" y="425" fill="#555a53" font-size="32" font-weight="600" letter-spacing="2">
        ${meta.totalRecords} SOURCE-BACKED
      </text>
      <text x="1210" y="471" fill="#555a53" font-size="32" font-weight="600" letter-spacing="2">
        RECORDS
      </text>
      <text x="1210" y="548" fill="#555a53" font-size="32" font-weight="600" letter-spacing="2">
        ${meta.scoredClaims} SCORED CLAIMS
      </text>
      <text x="1210" y="610" fill="#555a53" font-size="25" font-weight="600" letter-spacing="1">
        ${meta.pointsEarned.toLocaleString("en-US")} / ${meta.pointsPossible.toLocaleString("en-US")} POINTS
      </text>
      <rect x="1210" y="654" width="466" height="2" fill="#242720"/>
      <text x="1210" y="730" fill="#555a53" font-size="30" font-weight="600" letter-spacing="2">
        DATASET ${meta.versionLabel.toUpperCase()}
      </text>
      <text x="1210" y="774" fill="#555a53" font-size="30" font-weight="600" letter-spacing="2">
        ${evaluationDate}
      </text>

      <rect x="55" y="865" width="1621" height="3" fill="#151714"/>
    </g>
  </svg>
`;

await sharp(Buffer.from(card))
  .png({ compressionLevel: 9, palette: true })
  .toFile(outputPath);

console.log(`Generated ${outputPath}`);
