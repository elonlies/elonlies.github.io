import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  claimScore,
  claims,
  datasetStats,
  findClaim,
  formatDate,
  formatVerdict,
  verdictTone,
} from "@/lib/data";

type ClaimPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return claims.map((claim) => ({ id: claim.record_id }));
}

export async function generateMetadata({
  params,
}: ClaimPageProps): Promise<Metadata> {
  const { id } = await params;
  const claim = findClaim(id);
  if (!claim) return { title: "Claim not found" };

  return {
    title: `${claim.record_id}: ${claim.display_verdict}`,
    description: claim.statement_paraphrase,
  };
}

function scoreExplanation(score: number | null, exclusionReason: string) {
  if (score === null) {
    return `Excluded from the ${datasetStats.roundedScore}% calculation. ${exclusionReason}`;
  }
  if (score === 100) {
    return "Full credit under the v2 rubric because the central claim was supported or the commitment was fulfilled materially as stated and on time.";
  }
  if (score === 75) {
    return "Three-quarter credit under the v2 rubric because the central claim held up with a limited qualification, delay, or scope deviation.";
  }
  if (score === 50) {
    return "Half credit under the v2 rubric because missing context, reduced scope, capability limits, or deadline performance materially changed the takeaway.";
  }
  if (score === 25) {
    return "Quarter credit under the v2 rubric because adequate credible support was unavailable, without enough evidence for a definitive False verdict.";
  }
  return "No credit under the v2 rubric because reliable evidence contradicted the central claim or the mature commitment was unfulfilled or reversed.";
}

function ExternalSource({
  href,
  title,
  label,
}: {
  href: string;
  title: string;
  label: string;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="source-link">
      <span>{label}</span>
      <strong>{title}</strong>
      <small>
        Open source <span className="sr-only">(opens in a new tab)</span>
        <span aria-hidden="true">↗</span>
      </small>
    </a>
  );
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { id } = await params;
  const claim = findClaim(id);
  if (!claim) notFound();

  const score = claimScore(claim);
  const claimIndex = claims.findIndex((item) => item.record_id === claim.record_id);
  const previousClaim = claimIndex > 0 ? claims[claimIndex - 1] : null;
  const nextClaim =
    claimIndex < claims.length - 1 ? claims[claimIndex + 1] : null;

  return (
    <main id="main-content">
      <article className="claim-detail">
        <header className="claim-detail__header">
          <div className="page-shell">
            <Link className="back-link" href="/score#evidence">
              <span aria-hidden="true">←</span> Back to evidence index
            </Link>
            <div className="claim-detail__meta">
              <span className="record-id">{claim.record_id}</span>
              <span>{formatDate(claim.statement_date)}</span>
              <span>{claim.organization_or_domain}</span>
              <span>{claim.primary_domain}</span>
            </div>
            <h1>{claim.statement_paraphrase}</h1>
            <div className="claim-detail__verdict-row">
              <span
                className={`verdict-chip verdict-${verdictTone(claim.verdict_category)}`}
                title={`Canonical category: ${formatVerdict(claim.verdict_category)}`}
              >
                {claim.display_verdict}
              </span>
              <span className="claim-detail__score">
                {score === null ? "Excluded from score" : `${score.toFixed(0)} / 100 points`}
              </span>
              <span>{claim.confidence} confidence</span>
              {claim.credible_sources_contest_claim === "Yes" ? (
                <span className="contestation-badge">
                  Contested by credible sources
                </span>
              ) : null}
            </div>
          </div>
        </header>

        <div className="page-shell claim-detail__body">
          <section className="evidence-chain" aria-labelledby="evidence-chain-title">
            <div className="subsection-heading">
              <p className="eyebrow">Evidence chain</p>
              <h2 id="evidence-chain-title">From statement to verdict.</h2>
            </div>
            <ol>
              <li>
                <span>01</span>
                <div>
                  <p className="eyebrow">Original statement</p>
                  <h3>{claim.statement_paraphrase}</h3>
                  <p>
                    {formatDate(claim.statement_date)} · {claim.claim_type}
                  </p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <p className="eyebrow">Measurable target</p>
                  <h3>{claim.target_date_or_timeframe}</h3>
                  <p>{claim.deadline_result}</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <p className="eyebrow">Observed outcome</p>
                  <h3>{claim.outcome_summary}</h3>
                  <p>Evaluated {formatDate(claim.evaluation_date)}</p>
                </div>
              </li>
              <li>
                <span>04</span>
                <div>
                  <p className="eyebrow">Verdict and score</p>
                  <h3>{claim.display_verdict}</h3>
                  <p>{scoreExplanation(score, claim.exclusion_reason)}</p>
                </div>
              </li>
            </ol>
          </section>

          <div className="claim-detail__grid">
            <section className="detail-panel" aria-labelledby="record-details-title">
              <p className="eyebrow">Record details</p>
              <h2 id="record-details-title">How this row was evaluated.</h2>
              <dl className="detail-list">
                <div>
                  <dt>Deadline result</dt>
                  <dd>{claim.deadline_result}</dd>
                </div>
                <div>
                  <dt>Eventual outcome</dt>
                  <dd>{claim.eventual_outcome}</dd>
                </div>
                <div>
                  <dt>Factual accuracy</dt>
                  <dd>{claim.factual_accuracy}</dd>
                </div>
                <div>
                  <dt>Canonical classification</dt>
                  <dd>{formatVerdict(claim.verdict_category)}</dd>
                </div>
                <div>
                  <dt>Score points</dt>
                  <dd>
                    {score === null ? "Not scored" : `${score} / 100`}
                  </dd>
                </div>
                <div>
                  <dt>Included in headline score</dt>
                  <dd>{claim.include_in_trust_score}</dd>
                </div>
                {claim.exclusion_reason ? (
                  <div>
                    <dt>Exclusion reason</dt>
                    <dd>{claim.exclusion_reason}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Research confidence</dt>
                  <dd>{claim.confidence}</dd>
                </div>
                <div>
                  <dt>Credible-source contestation</dt>
                  <dd>{claim.credible_sources_contest_claim}</dd>
                </div>
                {claim.contestation_resolution ? (
                  <div>
                    <dt>Contestation resolution</dt>
                    <dd>{claim.contestation_resolution}</dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section className="detail-panel" aria-labelledby="intent-title">
              <p className="eyebrow">Intent stays separate</p>
              <h2 id="intent-title">Was intentional deception established?</h2>
              <p className="intent-answer">{claim.deception_intent_status}</p>
              <p>
                This field is not inferred from a missed deadline or inaccurate
                outcome. The project uses “lie” only when evidence addresses the
                speaker’s state of mind, not as a synonym for “wrong.”
              </p>
              <Link className="text-link" href="/methodology#intent">
                Why this distinction matters <span aria-hidden="true">→</span>
              </Link>
            </section>
          </div>

          <section className="sources-section" aria-labelledby="sources-title">
            <div className="subsection-heading">
              <p className="eyebrow">Citations</p>
              <h2 id="sources-title">Read the underlying sources.</h2>
            </div>
            <div className="source-grid">
              <ExternalSource
                href={claim.statement_source_url}
                title={claim.statement_source_title}
                label={`Original statement · ${claim.statement_source_tier}`}
              />
              <ExternalSource
                href={claim.outcome_source_1_url}
                title={claim.outcome_source_1_title}
                label="Primary outcome source"
              />
              {claim.outcome_source_2_url && claim.outcome_source_2_title ? (
                <ExternalSource
                  href={claim.outcome_source_2_url}
                  title={claim.outcome_source_2_title}
                  label="Additional outcome source"
                />
              ) : null}
            </div>
          </section>

          <section className="research-notes" aria-labelledby="research-notes-title">
            <div className="subsection-heading">
              <p className="eyebrow">Audit trail</p>
              <h2 id="research-notes-title">Selection and scoring notes.</h2>
            </div>
            <dl>
              <div>
                <dt>v2 classification rationale</dt>
                <dd>{claim.classification_rationale}</dd>
              </div>
              <div>
                <dt>v1 → v2 audit</dt>
                <dd>
                  {claim.legacy_verdict} at{" "}
                  {claim.legacy_weighted_reliability_score
                    ? `${Number(claim.legacy_weighted_reliability_score) * 100} / 100`
                    : "not scored"}{" "}
                  became {formatVerdict(claim.verdict_category)} at{" "}
                  {score === null ? "not scored" : `${score} / 100`}.
                </dd>
              </div>
              <div>
                <dt>Selection basis</dt>
                <dd>{claim.selection_basis}</dd>
              </div>
              <div>
                <dt>Source quality</dt>
                <dd>{claim.source_quality_notes}</dd>
              </div>
              <div>
                <dt>Methodology note</dt>
                <dd>{claim.methodology_notes}</dd>
              </div>
            </dl>
          </section>

          <nav className="record-pagination" aria-label="Adjacent evidence records">
            {previousClaim ? (
              <Link href={`/claims/${previousClaim.record_id}`}>
                <span>Previous record</span>
                <strong>
                  <span aria-hidden="true">←</span> {previousClaim.record_id}
                </strong>
              </Link>
            ) : (
              <span />
            )}
            {nextClaim ? (
              <Link href={`/claims/${nextClaim.record_id}`}>
                <span>Next record</span>
                <strong>
                  {nextClaim.record_id} <span aria-hidden="true">→</span>
                </strong>
              </Link>
            ) : null}
          </nav>
        </div>
      </article>
    </main>
  );
}
