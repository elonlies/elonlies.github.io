import type { Metadata } from "next";
import Link from "next/link";
import {
  claimTypeScores,
  classificationKey,
  datasetDownloads,
  datasetStats,
  formatDate,
  migrationChanges,
  publicDiscourseCategoryNames,
  ratingBands,
  relatedEntityNames,
  subjectCategoryNames,
  subjectCategoryScores,
  verdictTone,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Methodology",
  description: `The ${datasetStats.versionLabel} sources, classification key, scoring rules, selection limits, update policy, migration trail, and downloads for the Elon Musk Trust Score.`,
};

const scoredRules = classificationKey.filter(
  (rule) => rule.included_in_score === "Yes",
);
const excludedRules = classificationKey.filter(
  (rule) => rule.included_in_score === "No",
);
const listFormatter = new Intl.ListFormat("en-US", {
  style: "long",
  type: "conjunction",
});
const subjectCategoryList = listFormatter.format(subjectCategoryNames);
const publicDiscourseCategoryList = listFormatter.format(
  publicDiscourseCategoryNames,
);

export default function MethodologyPage() {
  return (
    <main id="main-content">
      <section className="detail-hero">
        <div className="page-shell">
          <Link className="back-link" href="/">
            <span aria-hidden="true">←</span> Back to overview
          </Link>
          <div className="method-hero">
            <p className="eyebrow">
              Dataset {datasetStats.versionLabel} · Evaluated{" "}
              {formatDate(datasetStats.evaluationDate)}
            </p>
            <h1>How the Trust Score works.</h1>
            <p className="lede">
              The score is an editorial model applied to a manually researched,
              source-backed corpus. Its rules, limits, source package, and migration
              trail remain as inspectable as its conclusion.
            </p>
          </div>
        </div>
      </section>

      <article className="method-article page-shell">
        <section className="method-section">
          <div className="method-section__number">01</div>
          <div>
            <p className="eyebrow">Scope</p>
            <h2>What this dataset is—and is not.</h2>
            <p>
              The corpus contains {datasetStats.totalRecords} concrete Elon Musk
              statements, commitments, forecasts, promises, and factual assertions
              spanning {subjectCategoryList}. Company affiliation is not required:
              the same subject-first taxonomy covers organizational claims, public
              affairs, and statements about science, media, legal matters, or Musk
              personally.
            </p>
            <p>
              It is not literally every sentence Musk has spoken or posted. That
              universe is unbounded and includes deleted material, private remarks,
              jokes, opinions, and claims with no testable meaning. The corpus
              deliberately favors consequential, concrete, verifiable claims.
              {datasetStats.publicDiscourseTopicClaimCount > 0 ? (
                <>
                  {" "}
                  The optional public-discourse topic is populated on{" "}
                  {datasetStats.publicDiscourseTopicClaimCount} records across{" "}
                  {datasetStats.publicDiscourseCategoryCount} more specific topics:{" "}
                  {publicDiscourseCategoryList}.
                </>
              ) : null}
            </p>
            <div className="callout callout--warning">
              <strong>The central limitation is selection bias.</strong>
              <p>
                This is not a statistically random sample. The public-discourse
                subset is especially adverse-selected because fact-checkers examine
                disputed statements rather than random everyday remarks. The score
                must not be described as the percentage of everything Musk says
                that is true.
              </p>
            </div>
          </div>
        </section>

        <section className="method-section">
          <div className="method-section__number">02</div>
          <div>
            <p className="eyebrow">Sources</p>
            <h2>How evidence is prioritized.</h2>
            <ol className="source-hierarchy">
              <li>
                <strong>Original record.</strong>
                <span>
                  Musk’s statement, company material, filing, court or regulator
                  record, or another official source.
                </span>
              </li>
              <li>
                <strong>Major reporting.</strong>
                <span>
                  Reuters, Associated Press, The New York Times, or another major
                  outlet documenting the statement and measurable outcome.
                </span>
              </li>
              <li>
                <strong>Transparent fact-checking.</strong>
                <span>
                  Established specialist fact-checkers when they show their sources
                  and link the original claim.
                </span>
              </li>
              <li>
                <strong>Secondary material.</strong>
                <span>
                  Used only when stronger evidence is unavailable, with research
                  confidence reduced.
                </span>
              </li>
            </ol>
            <p>
              Every row includes a statement-source URL and at least one
              outcome-source URL. The current package contains{" "}
              {datasetStats.citationCount} citation placements across{" "}
              {datasetStats.uniqueSourceCount} distinct URLs. Statements are
              paraphrased to reduce quotation errors and preserve fair-use
              restraint; the linked source carries the original context.
            </p>
          </div>
        </section>

        <section className="method-section">
          <div className="method-section__number">03</div>
          <div>
            <p className="eyebrow">Scoring</p>
            <h2>
              {datasetStats.scoredVerdictCount} scored categories,{" "}
              {datasetStats.excludedVerdictCount} visible exclusions.
            </h2>
            <p>
              The {datasetStats.versionLabel} Trust Score is total points earned
              divided by total points possible. The current corpus earns{" "}
              {datasetStats.pointsEarned.toLocaleString("en-US")} of{" "}
              {datasetStats.pointsPossible.toLocaleString("en-US")} possible
              points across {datasetStats.scoredClaims} scored claims:{" "}
              {datasetStats.exactScore}%, rounded to{" "}
              {datasetStats.roundedScore}% for the homepage.
            </p>
            <div className="score-rules">
              {scoredRules.map((rule) => (
                <article key={rule.classification}>
                  <strong>{rule.score_points}</strong>
                  <div>
                    <h3>{rule.classification}</h3>
                    <p>{rule.definition}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="fine-print">
              {excludedRules.map((rule) => rule.classification).join(" and ")} rows
              receive no score and remain visible. Every score-bearing category and
              point value above comes directly from the current classification-key
              CSV.
            </p>
          </div>
        </section>

        <section className="method-section" id="intent">
          <div className="method-section__number">04</div>
          <div>
            <p className="eyebrow">Verdicts</p>
            <h2>Canonical categories and contextual display labels.</h2>
            <div className="verdict-glossary">
              {classificationKey.map((rule) => (
                <article key={rule.classification}>
                  <span
                    className={`verdict-chip verdict-${verdictTone(rule.classification)}`}
                  >
                    {rule.classification}
                  </span>
                  <p>{rule.definition}</p>
                </article>
              ))}
            </div>
            <div className="callout">
              <strong>Promise and forecast labels adapt to context.</strong>
              <p>
                The canonical category controls scoring. A promise may display as
                “Fulfilled Late,” while a forecast in the same Misleading category
                may display as “Materially Late.” The category remains visible on
                every evidence record.
              </p>
            </div>
            <div className="callout callout--warning">
              <strong>Contestation is a badge, not a verdict.</strong>
              <p>
                {datasetStats.contestedClaims} records are explicitly contested by
                credible sources. Contestation remains independent of the primary
                verdict after the total evidence is evaluated.
              </p>
            </div>
            <div className="callout">
              <strong>A lie requires evidence of intent.</strong>
              <p>
                False, late, unsupported, or reversed does not automatically mean
                deliberate deception. The dataset tracks intent separately and
                avoids inferring the speaker’s state of mind from outcome alone.
              </p>
            </div>
          </div>
        </section>

        <section className="method-section">
          <div className="method-section__number">05</div>
          <div>
            <p className="eyebrow">Rating bands</p>
            <h2>How the conclusion is assigned.</h2>
            <div className="rating-bands">
              {ratingBands.map((band) => (
                <div key={band.range}>
                  <strong>{band.range}</strong>
                  <span>{band.label}</span>
                </div>
              ))}
            </div>
            <p className="fine-print">
              These thresholds are editorial judgments, not a scientific standard.
              At {datasetStats.exactScore}, the current corpus falls within “
              {datasetStats.conclusion}.”
            </p>
          </div>
        </section>

        <section className="method-section">
          <div className="method-section__number">06</div>
          <div>
            <p className="eyebrow">Structure</p>
            <h2>Subject categories are primary; entities remain separate.</h2>
            <ol className="source-hierarchy">
              {subjectCategoryScores.map((category) => (
                <li key={category.name}>
                  <strong>{category.name}.</strong>
                  <span>
                    {category.totalRecords} tracked record
                    {category.totalRecords === 1 ? "" : "s"}; {category.count}{" "}
                    included in the score.
                  </span>
                </li>
              ))}
            </ol>
            <p>
              Every row has one of these {subjectCategoryNames.length} subject
              categories in <code>primary_domain</code>. The{" "}
              <code>related_entity</code> field is an independent context facet,
              currently containing {relatedEntityNames.length} distinct entities;
              it does not determine what the claim is about. The optional{" "}
              <code>public_discourse_category</code> field adds a narrower public
              topic only where it applies.
            </p>
            <p>
              Claim type describes the statement&apos;s form, not its subject. The
              current statement forms are:
            </p>
            <ol className="source-hierarchy">
              {claimTypeScores.map((type) => (
                <li key={type.name}>
                  <strong>{type.name}.</strong>
                  <span>
                    {type.totalRecords} tracked record
                    {type.totalRecords === 1 ? "" : "s"}; {type.count} included in
                    the score.
                  </span>
                </li>
              ))}
            </ol>
            <p className="fine-print">
              All names and counts above come from the row-level CSV and update
              automatically when the data package changes. The legacy{" "}
              <code>organization_or_domain</code> field remains in the downloadable
              package for migration and summary-audit compatibility, not as the
              visitor-facing category system.
            </p>
          </div>
        </section>

        <section className="method-section">
          <div className="method-section__number">07</div>
          <div>
            <p className="eyebrow">External context</p>
            <h2>A broader benchmark, kept separate.</h2>
            <p>
              A June 2026 New York Times audit reviewed more than 69,000 Musk
              social posts and 19 Tesla investor calls, then manually evaluated
              602 concrete future-deadline business goals. It reported 19%
              achieved on time, 35% late or unfulfilled, 33% unclear or without a
              public update, and 13% with future deadlines.
            </p>
            <p>
              That research is directionally relevant but uses different selection
              and scoring rules. Its entries are not represented as rows in this
              corpus and do not affect this Trust Score.
            </p>
            <a
              className="text-link"
              href="https://www.nytimes.com/interactive/2026/06/02/technology/elon-musk-promises-spacex-ipo.html"
              target="_blank"
              rel="noreferrer"
            >
              Read the New York Times audit{" "}
              <span className="sr-only">(opens in a new tab)</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        <section className="method-section">
          <div className="method-section__number">08</div>
          <div>
            <p className="eyebrow">Maintenance</p>
            <h2>Corrections should leave a trail.</h2>
            <ul className="policy-list">
              <li>Preserve every existing record ID and correction history.</li>
              <li>Add new claims as new rows and document corrections in migration.</li>
              <li>Recheck Pending and Unresolved rows on a fixed cadence.</li>
              <li>Keep evaluation dates and outcome sources current.</li>
              <li>Publish corrections and scoring changes in version control.</li>
              <li>
                Require a second review for high-impact, personal, legal, medical,
                political, or intent-sensitive classifications.
              </li>
              <li>Recompute the summary directly from the row-level CSV.</li>
            </ul>
            <div className="changelog">
              <div>
                <span>{datasetStats.versionLabel}</span>
                <time dateTime={datasetStats.evaluationDate}>
                  {formatDate(datasetStats.evaluationDate)}
                </time>
              </div>
              <p>
                {migrationChanges
                  .map(
                    (change) =>
                      `${change.count} record${change.count === 1 ? "" : "s"} ${change.label.toLowerCase()}`,
                  )
                  .join("; ")}
                . The row-by-row migration CSV preserves the complete update trail.
              </p>
            </div>
          </div>
        </section>

        <section className="method-section method-section--download">
          <div className="method-section__number">09</div>
          <div>
            <p className="eyebrow">Downloads</p>
            <h2>
              Inspect or reuse the complete {datasetStats.versionLabel} package.
            </h2>
            <div className="download-links download-links--left">
              {datasetDownloads.map((download, index) => (
                <a
                  className={
                    index === 0 ? "button" : "button button--secondary"
                  }
                  href={download.href}
                  download
                  key={download.role}
                >
                  {download.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
