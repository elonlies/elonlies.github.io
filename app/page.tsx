import type { Metadata } from "next";
import Link from "next/link";
import { ScoreHero } from "@/components/ScoreHero";
import {
  claimScore,
  findClaim,
  formatDate,
  formatVerdict,
  supportMetrics,
  verdictTone,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "A sourced record of Elon Musk’s public claims",
  description:
    "A provisional 33/100 Trust Score built from 100 citation-backed public claims, promises, forecasts, and outcomes.",
};

export default function Home() {
  const featuredClaims = ["TESLA-006", "SPACEX-004", "X-002"]
    .map(findClaim)
    .filter((claim) => claim !== undefined);

  return (
    <main id="main-content">
      <section className="home-hero page-shell">
        <div className="home-hero__intro">
          <p className="eyebrow">A sourced ledger of claims and outcomes</p>
          <h1>
            Trust should be
            <br />
            measured against the record.
          </h1>
          <p className="lede">
            One clear conclusion up front. Every claim, verdict, exclusion, and
            citation close enough to challenge it.
          </p>
        </div>
        <ScoreHero />
      </section>

      <section className="scope-strip" aria-label="Dataset scope">
        <div className="page-shell scope-strip__inner">
          <div>
            <strong>100</strong>
            <span>source-backed records</span>
          </div>
          <div>
            <strong>81</strong>
            <span>included in the score</span>
          </div>
          <div>
            <strong>19</strong>
            <span>pending or excluded</span>
          </div>
          <div>
            <strong>91%</strong>
            <span>high-confidence research</span>
          </div>
        </div>
      </section>

      <section className="section page-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The record at a glance</p>
            <h2>Evidence, not vibes.</h2>
          </div>
          <p>
            The headline score is a weighted summary. These measures show what sits
            underneath it—and where the sample requires caution.
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
        <div className="section-link-row">
          <Link className="text-link" href="/score">
            Examine the full calculation <span aria-hidden="true">→</span>
          </Link>
          <Link className="text-link" href="/methodology">
            Read the methodology <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="section section--ink">
        <div className="page-shell">
          <div className="section-heading section-heading--light">
            <div>
              <p className="eyebrow">Three records, three outcomes</p>
              <h2>The score preserves the difference.</h2>
            </div>
            <p>
              On-time delivery, late delivery, and a reversed promise are not
              flattened into a simplistic true-or-false tally.
            </p>
          </div>
          <div className="featured-claims">
            {featuredClaims.map((claim) => {
              const score = claimScore(claim);
              return (
                <article className="featured-claim" key={claim.record_id}>
                  <div className="featured-claim__meta">
                    <span className="record-id">{claim.record_id}</span>
                    <span>{formatDate(claim.statement_date)}</span>
                  </div>
                  <h3>{claim.statement_paraphrase}</h3>
                  <p>{claim.outcome_summary}</p>
                  <div className="featured-claim__footer">
                    <span className={`verdict-chip verdict-${verdictTone(claim.verdict)}`}>
                      {formatVerdict(claim.verdict)}
                    </span>
                    <span>{score === null ? "Excluded" : `${score.toFixed(0)} points`}</span>
                  </div>
                  <Link href={`/claims/${claim.record_id}`}>
                    Open the evidence <span aria-hidden="true">→</span>
                  </Link>
                </article>
              );
            })}
          </div>
          <div className="section-link-row section-link-row--light">
            <Link className="text-link" href="/score#evidence">
              Browse all 100 records <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section page-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A transparent conclusion</p>
            <h2>Strong claim. Visible limits.</h2>
          </div>
        </div>
        <div className="principles-grid">
          <article>
            <span className="principle-number">01</span>
            <h3>Sources first</h3>
            <p>
              Every record links the original statement and at least one outcome
              source. Paraphrases reduce quotation and context errors.
            </p>
          </article>
          <article>
            <span className="principle-number">02</span>
            <h3>Intent stays separate</h3>
            <p>
              Wrong, late, unsupported, or reversed does not automatically mean a
              deliberate lie. The dataset tracks established intent separately.
            </p>
          </article>
          <article>
            <span className="principle-number">03</span>
            <h3>Exclusions stay visible</h3>
            <p>
              Pending, unclear, and unscorable claims remain searchable so the
              denominator cannot quietly hide inconvenient records.
            </p>
          </article>
        </div>
      </section>

      <section className="section section--download" id="downloads">
        <div className="page-shell download-panel">
          <div>
            <p className="eyebrow">Use the underlying research</p>
            <h2>Download the complete dataset.</h2>
            <p>
              One hundred unique records, 29 fields, statement citations, outcome
              citations, scoring decisions, confidence, and inclusion notes.
            </p>
          </div>
          <div className="download-links">
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
              Methodology
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
