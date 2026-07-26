import type { Metadata } from "next";
import Link from "next/link";
import { ClaimsExplorer } from "@/components/ClaimsExplorer";
import {
  DomainLedger,
  OrganizationLedger,
} from "@/components/OrganizationLedger";
import { OutcomeLedger } from "@/components/OutcomeLedger";
import { WeightCalculator } from "@/components/WeightCalculator";
import {
  claims,
  datasetStats,
  scoreGroups,
  supportMetrics,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Why Elon Musk scores 36%",
  description:
    "The calculation, organization breakdowns, outcome distribution, alternative-weight calculator, and all 100 evidence records.",
};

export default function ScorePage() {
  return (
    <main id="main-content">
      <section className="detail-hero detail-hero--score">
        <div className="page-shell">
          <Link className="back-link" href="/">
            <span aria-hidden="true">←</span> Back to overview
          </Link>
          <div className="detail-hero__grid">
            <div>
              <div className="label-row">
                <p className="eyebrow">The calculation</p>
                <span className="provisional-tag provisional-tag--light">
                  Provisional
                </span>
              </div>
              <h1>
                Why Elon Musk scores{" "}
                <span
                  title={`Exact calculation: ${datasetStats.pointsEarned.toLocaleString("en-US")} / ${datasetStats.pointsPossible.toLocaleString("en-US")} points`}
                >
                  {datasetStats.roundedScore}%
                </span>
              </h1>
              <p className="lede">
                Based on his record of verifiable public statements and promises in
                this tracked dataset, Elon Musk is not trustworthy.
              </p>
            </div>
            <div className="formula-card">
              <span className="formula-card__points">
                {datasetStats.pointsEarned.toLocaleString("en-US")}
              </span>
              <span>points earned</span>
              <div className="formula-card__rule" />
              <span className="formula-card__points">
                {datasetStats.pointsPossible.toLocaleString("en-US")}
              </span>
              <span>points possible across {datasetStats.scoredClaims} claims</span>
              <div className="formula-card__result">
                = {datasetStats.exactScore}%, rounded to{" "}
                <strong>{datasetStats.roundedScore}%</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section page-shell">
        <div className="scope-notes" aria-label="Important limitations">
          <article>
            <span>01</span>
            <p>
              This is a curated corpus of consequential, verifiable claims—not a
              random sample of everything Musk has said.
            </p>
          </article>
          <article>
            <span>02</span>
            <p>
              A missed, false, or unsupported claim does not by itself establish
              that the speaker intended to deceive.
            </p>
          </article>
          <article>
            <span>03</span>
            <p>
              {datasetStats.excludedClaims} Pending or Unresolved records stay
              public but do not affect the headline denominator.
            </p>
          </article>
        </div>
      </section>

      <section className="section page-shell section--ruled">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Supporting measures</p>
            <h2>What the single score contains.</h2>
          </div>
          <p>
            Each denominator answers a different question. The labels stay scoped
            to this verified corpus.
          </p>
        </div>
        <div className="metric-ledger">
          {supportMetrics.map((metric) => (
            <div className="metric-row" key={metric.label}>
              <div>
                <h3>{metric.label}</h3>
                <p>{metric.note}</p>
              </div>
              <div className="metric-row__value">
                <strong>{metric.value}</strong>
                <span>{metric.fraction}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section page-shell section--ruled">
        <div className="split-analysis">
          <div>
            <div className="subsection-heading">
              <p className="eyebrow">Score by primary domain</p>
              <h2>Four subject areas, disclosed separately.</h2>
              <p>
                Weighted score among included records. Every result shows its
                denominator.
              </p>
            </div>
            <DomainLedger />
          </div>
          <div>
            <div className="subsection-heading">
              <p className="eyebrow">Score by organization</p>
              <h2>Different records, different sample sizes.</h2>
              <p>
                Organization scores remain sensitive to the claims selected for
                each group.
              </p>
            </div>
            <OrganizationLedger />
          </div>
        </div>
      </section>

      <section className="section page-shell section--ruled">
        <div className="subsection-heading">
          <p className="eyebrow">All {datasetStats.totalRecords} records</p>
          <h2>Canonical verdict distribution.</h2>
          <p>
            Display labels adapt to promises and forecasts, while these seven
            categories keep the numerical model consistent.
          </p>
        </div>
        <OutcomeLedger />
      </section>

      <section className="section section--ink">
        <div className="page-shell">
          <div className="section-heading section-heading--light">
            <div>
              <p className="eyebrow">Challenge the weights</p>
              <h2>Recalculate the score yourself.</h2>
            </div>
            <p>
              The published verdicts stay fixed. Change how much credit each score
              tier receives and see the result immediately.
            </p>
          </div>
          <WeightCalculator
            scoreGroups={scoreGroups}
            scoredClaimCount={datasetStats.scoredClaims}
            publishedScore={datasetStats.exactScore}
          />
        </div>
      </section>

      <section className="section page-shell" id="evidence">
        <div className="section-heading evidence-heading">
          <div>
            <p className="eyebrow">The complete evidence index</p>
            <h2>The record, claim by claim.</h2>
          </div>
          <p>
            Search all {datasetStats.totalRecords} records. Open any claim to
            inspect its original source, measured outcome, scoring contribution,
            confidence, contestation status, and intent status.
          </p>
        </div>
        <ClaimsExplorer claims={claims} />
      </section>

      <section className="section section--download">
        <div className="page-shell compact-cta">
          <div>
            <p className="eyebrow">Audit the rules too</p>
            <h2>See how every verdict and exclusion works.</h2>
          </div>
          <Link className="button" href="/methodology">
            Read the methodology
          </Link>
        </div>
      </section>
    </main>
  );
}
