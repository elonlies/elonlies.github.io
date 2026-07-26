import type { Metadata } from "next";
import Link from "next/link";
import {
  classificationKey,
  datasetStats,
  formatDate,
  ratingBands,
  verdictTone,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "The v2 sources, classification key, scoring rules, selection limits, update policy, migration trail, and downloads for the Elon Musk Trust Score.",
};

const scoredRules = classificationKey.filter(
  (rule) => rule.included_in_score === "Yes",
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
              Dataset v2 · Evaluated {formatDate(datasetStats.evaluationDate)}
            </p>
            <h1>How the Trust Score works.</h1>
            <p className="lede">
              The score is an editorial model applied to a manually researched,
              source-backed corpus. Its rules, limits, and v1-to-v2 changes remain
              as inspectable as its conclusion.
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
              spanning Tesla, SpaceX, X/Twitter, Neuralink, The Boring Company, and
              public discourse.
            </p>
            <p>
              It is not literally every sentence Musk has spoken or posted. That
              universe is unbounded and includes deleted material, private remarks,
              jokes, opinions, and claims with no testable meaning. The corpus
              deliberately favors consequential, concrete, verifiable claims.
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
              outcome-source URL. Statements are paraphrased to reduce quotation
              errors and preserve fair-use restraint; the linked source carries the
              original context.
            </p>
          </div>
        </section>

        <section className="method-section">
          <div className="method-section__number">03</div>
          <div>
            <p className="eyebrow">Scoring</p>
            <h2>Five scored categories, two visible exclusions.</h2>
            <p>
              The v2 Trust Score is total points earned divided by total points
              possible. The current corpus earns{" "}
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
              Unresolved and Pending rows receive no score and remain visible.
              Unsupported receives 25 points because the available record did not
              justify full trust but also did not justify a definitive False
              verdict.
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
                credible sources. A contested claim can still be True, Mostly True,
                Misleading, Unsupported, False, or Unresolved after the evidence is
                evaluated.
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
            <h2>Claim types and primary domains stay separate.</h2>
            <ol className="source-hierarchy">
              <li>
                <strong>Factual Assertion.</strong>
                <span>A testable statement about what is or was true.</span>
              </li>
              <li>
                <strong>Promise or Commitment.</strong>
                <span>
                  A future action or capability substantially within Musk’s or an
                  organization’s control.
                </span>
              </li>
              <li>
                <strong>Prediction or Forecast.</strong>
                <span>
                  A forecast about a future result, including outcomes not fully
                  under his control.
                </span>
              </li>
              <li>
                <strong>Opinion or Rhetoric.</strong>
                <span>
                  Normally excluded unless it contains a separable factual
                  proposition.
                </span>
              </li>
            </ol>
            <p>
              Primary domains normalize the subject matter into Business &
              Technology, Politics & Government, Science & Health, Personal &
              Legal, and Media & Society. The current seed corpus contains no
              dedicated Personal & Legal row, but the schema supports future
              additions.
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
              <li>Preserve every existing record ID and legacy field.</li>
              <li>Add new claims as new rows instead of overwriting history.</li>
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
                <span>v2</span>
                <time dateTime="2026-07-26">July 26, 2026</time>
              </div>
              <p>
                Replaced eleven legacy outcomes with seven canonical categories,
                normalized claim types and domains, added contestation status, and
                published a row-by-row migration audit.
              </p>
            </div>
            <div className="changelog">
              <div>
                <span>v1</span>
                <time dateTime="2026-07-26">July 26, 2026</time>
              </div>
              <p>
                Initial 100-record corpus, summary metrics, scoring rubric, and
                source methodology.
              </p>
            </div>
          </div>
        </section>

        <section className="method-section method-section--download">
          <div className="method-section__number">09</div>
          <div>
            <p className="eyebrow">Downloads</p>
            <h2>Inspect or reuse the complete v2 package.</h2>
            <div className="download-links download-links--left">
              <a
                className="button"
                href="/downloads/elon_musk_claims_verified_v2.csv"
                download
              >
                Row-level CSV
              </a>
              <a
                className="button button--secondary"
                href="/downloads/elon_musk_claims_summary_v2.csv"
                download
              >
                Summary CSV
              </a>
              <a
                className="button button--secondary"
                href="/downloads/elon_musk_claims_classification_key_v2.csv"
                download
              >
                Classification key
              </a>
              <a
                className="button button--secondary"
                href="/downloads/elon_musk_claims_migration_v1_to_v2.csv"
                download
              >
                v1 → v2 migration
              </a>
              <a
                className="button button--secondary"
                href="/downloads/elon_musk_claims_methodology_v2.md"
                download
              >
                Full methodology
              </a>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
