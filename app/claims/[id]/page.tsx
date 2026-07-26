import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  claimScore,
  claims,
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
    title: `${claim.record_id}: ${formatVerdict(claim.verdict)}`,
    description: claim.statement_paraphrase,
  };
}

function scoreExplanation(score: number | null, verdict: string) {
  if (score === null) {
    if (verdict === "PENDING") {
      return "Excluded from the 33/100 calculation because the measurable deadline has not elapsed.";
    }
    return "Excluded from the 33/100 calculation because this record is unresolved, subjective, or not objectively scoreable under the published rules.";
  }
  if (score === 100) {
    return "Full credit under the published rubric because the record was assessed as accurate or fully fulfilled.";
  }
  if (score === 75) {
    return "Three-quarter credit under the published rubric for strong partial delivery or a result completed with modest lateness.";
  }
  if (score === 50) {
    return "Half credit under the published rubric for material partial delivery or a substantially late result.";
  }
  if (score === 25) {
    return "Quarter credit under the published rubric for weak partial delivery.";
  }
  return "No credit under the published rubric because the record was assessed as false, unsupported, reversed, or not fulfilled.";
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
              <span>{claim.topic}</span>
            </div>
            <h1>{claim.statement_paraphrase}</h1>
            <div className="claim-detail__verdict-row">
              <span className={`verdict-chip verdict-${verdictTone(claim.verdict)}`}>
                {formatVerdict(claim.verdict)}
              </span>
              <span className="claim-detail__score">
                {score === null ? "Excluded from score" : `${score.toFixed(0)} / 100 points`}
              </span>
              <span>{claim.confidence} confidence</span>
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
                    {formatDate(claim.statement_date)} · {claim.statement_type}
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
                  <h3>{formatVerdict(claim.verdict)}</h3>
                  <p>{scoreExplanation(score, claim.verdict)}</p>
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
                  <dt>Eventual fulfillment</dt>
                  <dd>{claim.eventual_fulfillment}</dd>
                </div>
                <div>
                  <dt>Factual accuracy</dt>
                  <dd>{claim.factual_accuracy}</dd>
                </div>
                <div>
                  <dt>Binary resolved score</dt>
                  <dd>
                    {claim.binary_resolved_score === ""
                      ? "Not applicable"
                      : claim.binary_resolved_score}
                  </dd>
                </div>
                <div>
                  <dt>On-time score</dt>
                  <dd>
                    {claim.on_time_score === ""
                      ? "Not applicable"
                      : claim.on_time_score}
                  </dd>
                </div>
                <div>
                  <dt>Weighted reliability</dt>
                  <dd>
                    {claim.weighted_reliability_score === ""
                      ? "Not scored"
                      : `${Number(claim.weighted_reliability_score) * 100} / 100`}
                  </dd>
                </div>
                <div>
                  <dt>Included in headline score</dt>
                  <dd>{claim.included_in_site_percentage}</dd>
                </div>
                <div>
                  <dt>Research confidence</dt>
                  <dd>{claim.confidence}</dd>
                </div>
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
