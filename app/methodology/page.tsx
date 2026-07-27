import type { Metadata } from "next";
import Link from "next/link";
import {
  claimTypeScores,
  classificationKey,
  datasetDownloads,
  datasetStats,
  evidenceMetricDefinitions,
  formatDate,
  intentAnswerDistribution,
  intentAssessmentDistribution,
  migrationChanges,
  organizationContextNames,
  ratingBands,
  subjectCategoryNames,
  subjectCategoryScores,
  strictPromiseAudit,
  topicCategoryNames,
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
const topicCategoryList = listFormatter.format(topicCategoryNames);

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
              {datasetStats.topicCategoryClaimCount > 0 ? (
                <>
                  {" "}
                  The optional Topic category is populated on{" "}
                  {datasetStats.topicCategoryClaimCount} records across{" "}
                  {datasetStats.topicCategoryCount} cross-cutting topics:{" "}
                  {topicCategoryList}.
                </>
              ) : null}
            </p>
            <div className="callout callout--warning">
              <strong>The central limitation is selection bias.</strong>
              <p>
                This is not a statistically random sample. The public-discourse
                topic-tagged subset is especially adverse-selected because
                fact-checkers examine disputed statements rather than random
                everyday remarks. The score must not be described as the
                percentage of everything Musk says that is true.
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
            <h3>Evidence structure is scored and audited separately.</h3>
            <p>
              Each of the {datasetStats.totalRecords} claims has one source-audit
              record. The component scores describe how strong and direct the
              cited evidence is; they are not decimal-level probabilities that a
              verdict is correct.
            </p>
            <div className="score-rules">
              {evidenceMetricDefinitions
                .filter((metric) =>
                  [
                    "statement_evidence_quality_score",
                    "outcome_evidence_quality_score",
                    "corroboration_score",
                    "directness_score",
                  ].includes(metric.field),
                )
                .map((metric) => (
                  <article key={metric.field}>
                    <strong>{metric.maximum}</strong>
                    <div>
                      <h3>{metric.label}</h3>
                      <p>{metric.definition}</p>
                    </div>
                  </article>
                ))}
            </div>
            <p className="fine-print">
              The four components sum to 100. Verdict confidence begins with
              evidence strength and applies the published deductions for nuance,
              credible-source disagreement, unresolved conflicts, interested-party
              evidence, or missing independent corroboration. The current{" "}
              <code>{datasetStats.evaluationSchemaVersion}</code> package contains{" "}
              {datasetStats.sourceAuditRecordCount} source audits and{" "}
              {datasetStats.evaluationAuditRecordCount} field-level evaluation
              audits covering {datasetStats.auditMetricCount} outputs per claim.
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
            {strictPromiseAudit ? (
              <div className="callout">
                <strong>Promises and forecasts use a strict binary test.</strong>
                <p>
                  A matured promise or forecast passes only when every material
                  term—including timing—is met. A missed deadline fails the
                  original proposition even if the promised result arrives later.
                  Pending and genuinely unresolved records stay visible but are
                  excluded until they can be resolved.
                </p>
              </div>
            ) : null}
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
            {strictPromiseAudit ? (
              <div className="callout">
                <strong>Claim type determines the available verdicts.</strong>
                <p>
                  Promises and forecasts use True or False once resolved under the
                  strict material-terms rule. Mostly True, Misleading, and
                  Unsupported remain available only for factual assertions, where
                  evidence can support a nuanced finding.
                </p>
              </div>
            ) : (
              <div className="callout">
                <strong>Display labels preserve claim context.</strong>
                <p>
                  The canonical category controls scoring while the row-level
                  display label explains how that category applies to the claim.
                </p>
              </div>
            )}
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
                deliberate deception. Every row provides a public Yes, No, or Not
                assessable answer and a more detailed intent status, while avoiding
                an inference about state of mind from outcome alone.
              </p>
            </div>
            <h3>Was intentional deception established?</h3>
            <div className="intent-method-grid">
              <div>
                <h3>Public answer</h3>
                <dl>
                  {intentAnswerDistribution.map((entry) => (
                    <div key={entry.label}>
                      <dt>{entry.label}</dt>
                      <dd>{entry.count}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <h3>Detailed assessment</h3>
                <dl>
                  {intentAssessmentDistribution.map((entry) => (
                    <div key={entry.label}>
                      <dt>{entry.label}</dt>
                      <dd>{entry.count}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <p className="fine-print">
              “No” means the cited evidence does not establish intentional
              deception. It does not convert a False, Misleading, Unsupported, or
              unfulfilled claim into a true one. “Not assessable” is reserved for
              Pending or Unresolved records.
            </p>
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
              <code>organization_or_domain</code> field is an independent context
              facet, currently containing {organizationContextNames.length}{" "}
              distinct values; it does not determine what the claim is about. The
              optional <code>public_discourse_category</code> field adds a
              cross-cutting Topic category wherever it applies, including claims
              associated with a company.{" "}
              <code>relationship_to_organization</code> describes how the
              organization or context relates to Musk.
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
              automatically when the data package changes. None of these context
              fields limits the subject taxonomy to organizations Musk has owned.
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
            <p className="fine-print">
              Correction and repetition fields describe what is documented in
              each row&apos;s cited evidence. They are not presented as an
              exhaustive search of every deleted post, interview, reply, or later
              repetition.
            </p>
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
