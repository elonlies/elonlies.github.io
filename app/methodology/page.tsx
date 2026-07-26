import type { Metadata } from "next";
import Link from "next/link";
import {
  ratingBands,
  verdictDescriptions,
  verdictLabels,
  verdictTone,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "Sources, verdict definitions, scoring rules, selection limits, update policy, and downloads for the Elon Musk Trust Score.",
};

const scoreRules = [
  {
    score: "100",
    label: "Accurate or fully fulfilled",
    description:
      "Full delivery, including commitments completed on time when a deadline applied.",
  },
  {
    score: "75",
    label: "Strong partial or slightly late",
    description:
      "Most material scope delivered, or a result arrived with modest lateness.",
  },
  {
    score: "50",
    label: "Material partial or substantially late",
    description:
      "A meaningful result happened, but important scope or timing was missed.",
  },
  {
    score: "25",
    label: "Weak partial delivery",
    description:
      "Limited progress occurred, but most of the measurable claim was unmet.",
  },
  {
    score: "0",
    label: "False, unsupported, reversed, or unfulfilled",
    description:
      "The factual assertion failed, the promise was reversed, or mature delivery did not happen.",
  },
];

export default function MethodologyPage() {
  return (
    <main id="main-content">
      <section className="detail-hero">
        <div className="page-shell">
          <Link className="back-link" href="/">
            <span aria-hidden="true">←</span> Back to overview
          </Link>
          <div className="method-hero">
            <p className="eyebrow">Dataset v1 · Evaluated July 26, 2026</p>
            <h1>How the Trust Score works.</h1>
            <p className="lede">
              The score is an editorial model applied to a manually researched,
              source-backed corpus. Its rules, limits, and corrections should be as
              inspectable as its conclusion.
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
              The corpus contains 100 concrete Elon Musk statements, commitments,
              forecasts, promises, and factual assertions spanning Tesla, SpaceX,
              X/Twitter, Neuralink, The Boring Company, and public discourse.
            </p>
            <p>
              It is not literally every sentence Musk has spoken or posted. That
              universe is unbounded and includes deleted material, private remarks,
              jokes, opinions, and claims with no testable meaning. The current
              corpus deliberately favors consequential, concrete, verifiable claims.
            </p>
            <div className="callout callout--warning">
              <strong>The central limitation is selection bias.</strong>
              <p>
                This is not a statistically random sample. Ten factual records come
                from PolitiFact’s speaker profile, where disputed statements are
                selected for checking. No result should be presented as the
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
                  Musk’s statement, company post, investor material, or official
                  government record.
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
                  Established specialist fact-checkers when they link the original
                  statement and show their sources.
                </span>
              </li>
              <li>
                <strong>Secondary material.</strong>
                <span>
                  Used only when stronger sources are unavailable, with research
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
            <h2>How one claim earns points.</h2>
            <p>
              Each included record receives a weighted reliability score between 0
              and 100. The headline score is the mean of those 81 claim scores:
              26.5 reliability points divided by 81, or 32.7/100.
            </p>
            <div className="score-rules">
              {scoreRules.map((rule) => (
                <article key={rule.score}>
                  <strong>{rule.score}</strong>
                  <div>
                    <h3>{rule.label}</h3>
                    <p>{rule.description}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="fine-print">
              Lateness does not map mechanically to one value. A late result can
              receive 75 or 50 depending on the missed timing and material scope.
              The row-level record shows the applied score and context.
            </p>
          </div>
        </section>

        <section className="method-section" id="intent">
          <div className="method-section__number">04</div>
          <div>
            <p className="eyebrow">Verdicts</p>
            <h2>More precise than “truth” or “lie.”</h2>
            <div className="verdict-glossary">
              {Object.entries(verdictLabels).map(([key, label]) => (
                <article key={key}>
                  <span className={`verdict-chip verdict-${verdictTone(key)}`}>
                    {label}
                  </span>
                  <p>{verdictDescriptions[key]}</p>
                </article>
              ))}
            </div>
            <div className="callout">
              <strong>A lie requires evidence of intent.</strong>
              <p>
                Public evidence often establishes only that a claim was inaccurate,
                unsupported, late, or unfulfilled. The dataset therefore tracks
                deception-intent status separately and usually records it as “Not
                established.”
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
              At 32.7, the current corpus falls within “Not trustworthy.”
            </p>
          </div>
        </section>

        <section className="method-section">
          <div className="method-section__number">06</div>
          <div>
            <p className="eyebrow">External context</p>
            <h2>A broader benchmark, kept separate.</h2>
            <p>
              A June 2026 New York Times audit reviewed more than 69,000 Musk social
              posts and 19 Tesla investor calls, then manually evaluated 602
              concrete future-deadline business goals. It reported 19% achieved on
              time, 35% late or unfulfilled, 33% unclear or without a public update,
              and 13% with future deadlines.
            </p>
            <p>
              Its 19% result is directionally comparable to this corpus’s 13.3%
              on-time rate, but the scopes and scoring rules differ. Those 602
              entries were not published as a downloadable row-level dataset and
              are not represented as part of this corpus.
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
          <div className="method-section__number">07</div>
          <div>
            <p className="eyebrow">Maintenance</p>
            <h2>Corrections should leave a trail.</h2>
            <ul className="policy-list">
              <li>Preserve every existing record ID.</li>
              <li>Add new claims as new rows instead of overwriting history.</li>
              <li>Recheck pending and unclear rows on a fixed cadence.</li>
              <li>Keep evaluation dates and outcome sources current.</li>
              <li>Record corrections in version control and publish a changelog.</li>
              <li>
                Require a second reviewer for high-impact or legally sensitive
                records.
              </li>
            </ul>
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
          <div className="method-section__number">08</div>
          <div>
            <p className="eyebrow">Downloads</p>
            <h2>Inspect or reuse the source files.</h2>
            <div className="download-links download-links--left">
              <a
                className="button"
                href="/downloads/elon_musk_claims_verified_v1.csv"
                download
              >
                Row-level CSV
              </a>
              <a
                className="button button--secondary"
                href="/downloads/elon_musk_claims_summary_v1.csv"
                download
              >
                Summary CSV
              </a>
              <a
                className="button button--secondary"
                href="/downloads/elon_musk_claims_methodology_v1.md"
                download
              >
                Original methodology
              </a>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
