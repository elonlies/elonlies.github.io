import type { Metadata } from "next";
import Link from "next/link";
import { YearlyTrendChart } from "@/components/YearlyTrendChart";
import {
  claimTypeScores,
  datasetStats,
  formatVerdict,
  outcomeDistribution,
  trendComparison,
  verdictColors,
  yearlyTrends,
  zeroPointVerdictLabel,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Visualize the record",
  description: `Explore annual Trust Score trends, zero-point record counts, verdict composition, and claim-type comparisons across the ${datasetStats.versionLabel} corpus.`,
};

let verdictCursor = 0;
const verdictGradient = outcomeDistribution
  .map((outcome) => {
    const start = verdictCursor;
    verdictCursor +=
      (outcome.count / datasetStats.totalRecords) * 100;
    return `${verdictColors[outcome.key]} ${start}% ${verdictCursor}%`;
  })
  .join(", ");

const maxAnnualRecords = Math.max(
  ...yearlyTrends.map((trend) => trend.total),
);
const minAnnualRecords = Math.min(
  ...yearlyTrends.map((trend) => trend.total),
);

function formatPeriodScore(score: number | null) {
  return score === null ? "Not scored" : `${score.toFixed(1)}%`;
}

export default function VisualizationsPage() {
  return (
    <main id="main-content">
      <section className="detail-hero">
        <div className="page-shell">
          <Link className="back-link" href="/">
            <span aria-hidden="true">←</span> Back to overview
          </Link>
          <div className="method-hero">
            <p className="eyebrow">
              Visualization section · Dataset {datasetStats.versionLabel}
            </p>
            <h1>See the pattern, not just the headline.</h1>
            <p className="lede">
              Annual trends, raw counts, verdict composition, and claim-type
              comparisons show what changed—and how much the sample size shapes
              what appears to change.
            </p>
          </div>
        </div>
      </section>

      <section className="section page-shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Direction over time</p>
            <h2>More honest, more dishonest, or somewhere between?</h2>
          </div>
          <p>
            The annual lines normalize each year to percentages. Point details
            expose the underlying number of tracked and scored claims.
          </p>
        </div>

        <div className="trend-readout" aria-label="Five-year trend comparison">
          <div>
            <span>{trendComparison.earlier.label}</span>
            <strong>{formatPeriodScore(trendComparison.earlier.score)}</strong>
            <small>{trendComparison.earlier.count} scored claims</small>
          </div>
          <div>
            <span>{trendComparison.recent.label}</span>
            <strong>{formatPeriodScore(trendComparison.recent.score)}</strong>
            <small>{trendComparison.recent.count} scored claims</small>
          </div>
          <div>
            <span>Change</span>
            <strong>
              {trendComparison.delta === null
                ? "Not enough data"
                : `${trendComparison.delta > 0 ? "+" : ""}${trendComparison.delta.toFixed(1)} pts`}
            </strong>
            <small>
              {trendComparison.delta === null
                ? "One window has no scored claims"
                : trendComparison.delta > 0
                  ? "Higher recent-window score"
                  : trendComparison.delta < 0
                    ? "Lower recent-window score"
                    : "No change between windows"}
            </small>
          </div>
        </div>

        <div className="callout callout--warning visualization-caveat">
          <strong>The chart does not prove an honesty trend.</strong>
          <p>
            The {trendComparison.recent.label} window can be compared with{" "}
            {trendComparison.earlier.label} in this corpus, but annual samples
            range from {minAnnualRecords} to {maxAnnualRecords} records and the
            topics selected change over time. This is a view of the tracked
            dataset, not a random sample of everything Musk said in each year. A{" "}
            {zeroPointVerdictLabel} verdict also does not by itself establish a
            deliberate lie.
          </p>
        </div>

        <YearlyTrendChart
          trends={yearlyTrends}
          zeroPointLabel={zeroPointVerdictLabel}
        />
      </section>

      <section className="section page-shell section--ruled">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Raw annual volume</p>
            <h2>
              {zeroPointVerdictLabel} records per year, with the denominator
              visible.
            </h2>
          </div>
          <p>
            Bar length shows how many records the corpus tracks in that year. Red
            shows the zero-point subset classified {zeroPointVerdictLabel}.
          </p>
        </div>

        <div
          className="annual-volume"
          aria-label={`${zeroPointVerdictLabel} and total records by year`}
        >
          {yearlyTrends.map((trend) => (
            <div className="annual-volume__row" key={`${trend.year}-volume`}>
              <strong>{trend.year}</strong>
              <div className="annual-volume__rail">
                <span
                  className="annual-volume__tracked"
                  style={{
                    width: `${(trend.total / maxAnnualRecords) * 100}%`,
                  }}
                >
                  <i
                    className="annual-volume__false"
                    style={{
                      width: `${(trend.falseCount / trend.total) * 100}%`,
                    }}
                  />
                </span>
              </div>
              <span>
                {trend.falseCount} {zeroPointVerdictLabel} / {trend.total} tracked
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="section page-shell section--ruled">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Two more ways to read the corpus</p>
            <h2>Composition and claim type.</h2>
          </div>
          <p>
            One view shows the whole verdict mix; the other compares the score
            earned by different kinds of statements.
          </p>
        </div>

        <div className="visualization-split">
          <section aria-labelledby="verdict-mix-title">
            <div className="subsection-heading">
              <p className="eyebrow">Part to whole</p>
              <h2 id="verdict-mix-title">Verdict mix.</h2>
            </div>
            <div className="verdict-mix">
              <div
                className="verdict-donut"
                style={{ background: `conic-gradient(${verdictGradient})` }}
                role="img"
                aria-label={`Verdict distribution across ${datasetStats.totalRecords} records`}
              >
                <div>
                  <strong>{datasetStats.totalRecords}</strong>
                  <span>records</span>
                </div>
              </div>
              <dl className="verdict-mix__legend">
                {outcomeDistribution.map((outcome) => (
                  <div key={`${outcome.key}-visualization`}>
                    <dt>
                      <i
                        style={{ background: verdictColors[outcome.key] }}
                        aria-hidden="true"
                      />
                      {formatVerdict(outcome.key)}
                    </dt>
                    <dd>{outcome.count}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section aria-labelledby="claim-type-title">
            <div className="subsection-heading">
              <p className="eyebrow">Shared-scale comparison</p>
              <h2 id="claim-type-title">Score by claim type.</h2>
            </div>
            <div className="type-score-list">
              {claimTypeScores.map((group) => (
                <div className="type-score-row" key={group.name}>
                  <div>
                    <strong>{group.name}</strong>
                    <span>
                      {group.count} scored of {group.totalRecords}
                    </span>
                  </div>
                  <div
                    className="type-score-row__rail"
                    role="img"
                    aria-label={
                      group.score === null
                        ? `${group.name}: not scored`
                        : `${group.name}: ${group.score.toFixed(1)} percent`
                    }
                  >
                    <span
                      style={{
                        width: `${group.score ?? 0}%`,
                      }}
                    />
                  </div>
                  <strong>
                    {group.score === null
                      ? "Not scored"
                      : `${group.score.toFixed(1)}%`}
                  </strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="section section--download">
        <div className="page-shell compact-cta">
          <div>
            <p className="eyebrow">Read charts with the rules beside them</p>
            <h2>See the scoring and selection methodology.</h2>
          </div>
          <Link className="button" href="/methodology">
            Read the methodology
          </Link>
        </div>
      </section>
    </main>
  );
}
