import type { Metadata } from "next";
import Link from "next/link";
import { ClaimsExplorer } from "@/components/ClaimsExplorer";
import { OrganizationLedger } from "@/components/OrganizationLedger";
import { OutcomeLedger } from "@/components/OutcomeLedger";
import { WeightCalculator } from "@/components/WeightCalculator";
import { claims, supportMetrics } from "@/lib/data";

export const metadata: Metadata = {
  title: "Why Elon Musk scores 33/100",
  description:
    "The calculation, organization breakdowns, outcome distribution, alternative-weight calculator, and all 100 evidence records.",
};

type ScorePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ScorePage({ searchParams }: ScorePageProps) {
  const params = await searchParams;

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
              <h1>Why Elon Musk scores 33/100</h1>
              <p className="lede">
                Based on his record of verifiable public statements and promises in
                this tracked dataset, Elon Musk is not trustworthy.
              </p>
            </div>
            <div className="formula-card">
              <span className="formula-card__points">26.5</span>
              <span>reliability points earned</span>
              <div className="formula-card__rule" />
              <span className="formula-card__points">81</span>
              <span>scored claims</span>
              <div className="formula-card__result">
                = 32.7, rounded to <strong>33</strong>
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
              Nineteen pending, unclear, or subjective records stay public but do
              not affect the headline denominator.
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
              <p className="eyebrow">Score by organization</p>
              <h2>Different records, different sample sizes.</h2>
              <p>
                Weighted score among included records. Every result shows its
                denominator.
              </p>
            </div>
            <OrganizationLedger />
          </div>
          <div>
            <div className="subsection-heading">
              <p className="eyebrow">All 100 records</p>
              <h2>Outcome distribution.</h2>
              <p>
                The data retains late, partial, pending, false, and reversed as
                distinct outcomes.
              </p>
            </div>
            <OutcomeLedger />
          </div>
        </div>
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
          <WeightCalculator />
        </div>
      </section>

      <section className="section page-shell" id="evidence">
        <div className="section-heading evidence-heading">
          <div>
            <p className="eyebrow">The complete evidence index</p>
            <h2>The record, claim by claim.</h2>
          </div>
          <p>
            Search all 100 records. Open any claim to inspect its original source,
            measured outcome, scoring contribution, confidence, and intent status.
          </p>
        </div>
        <ClaimsExplorer
          claims={claims}
          initialFilters={{
            search: firstValue(params.q),
            organization: firstValue(params.org),
            verdict: firstValue(params.verdict),
            type: firstValue(params.type),
            scope: firstValue(params.scope),
            sort: firstValue(params.sort),
          }}
        />
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
