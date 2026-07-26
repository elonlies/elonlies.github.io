import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  auditSources,
  findEvaluationAudit,
  findSourceAudit,
  splitAuditValues,
} from "@/lib/audit-data";
import {
  claimScore,
  claimSources,
  claims,
  datasetStats,
  evidenceMetricDefinitions,
  findClaim,
  findClassificationRule,
  findMigration,
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

function scoreExplanation(
  score: number | null,
  exclusionReason: string,
  verdict: string,
) {
  if (score === null) {
    return `Excluded from the ${datasetStats.roundedScore}% calculation. ${exclusionReason}`;
  }
  const rule = findClassificationRule(verdict);
  return `${score} of ${datasetStats.maxScorePoints} points under the ${datasetStats.versionLabel} rubric. ${rule?.definition ?? "See the classification key for the current scoring rule."}`;
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

function formatMetricName(value: string) {
  const labels: Record<string, string> = {
    deadline_result: "Deadline result",
    eventual_outcome: "Eventual outcome",
    factual_accuracy: "Factual accuracy",
    verdict_category: "Canonical verdict",
    score_points: "Score points",
    include_in_trust_score: "Inclusion in the Trust Score",
    confidence: "Research confidence",
    credible_sources_contest_claim: "Credible-source contestation",
    correction_status: "Correction status",
    repeated_after_correction: "Repetition after correction",
    intentional_deception_established: "Intentional-deception answer",
  };
  return (
    labels[value] ??
    value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (character) => character.toUpperCase())
  );
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { id } = await params;
  const claim = findClaim(id);
  if (!claim) notFound();

  const score = claimScore(claim);
  const scorePercentage =
    score === null ? null : (score / datasetStats.maxScorePoints) * 100;
  const sources = claimSources(claim);
  const sourceTitleByUrl = new Map(
    sources.map((source) => [source.href, source.title]),
  );
  const intentSources = splitAuditValues(
    claim.deception_intent_source_urls,
  ).map((href, index) => ({
    href,
    title: sourceTitleByUrl.get(href) ?? `Intent evidence ${index + 1}`,
  }));
  const evaluationAudit = findEvaluationAudit(claim.record_id);
  const sourceAudit = findSourceAudit(claim.record_id);
  const evidenceComponents = evidenceMetricDefinitions.filter((metric) =>
    [
      "statement_evidence_quality_score",
      "outcome_evidence_quality_score",
      "corroboration_score",
      "directness_score",
    ].includes(metric.field),
  );
  const sensitiveTopicTags = splitAuditValues(claim.sensitive_topic_tags);
  const migrationRow = findMigration(claim.record_id);
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
              <span>{claim.primary_domain}</span>
              {claim.public_discourse_category ? (
                <span>{claim.public_discourse_category}</span>
              ) : null}
              <span>{claim.organization_or_domain}</span>
              <span>{claim.claim_type}</span>
            </div>
            <h1>{claim.statement_paraphrase}</h1>
            <div className="claim-detail__verdict-row">
              <span
                className={`verdict-chip verdict-${verdictTone(claim.verdict_category)}`}
                title={`Canonical category: ${formatVerdict(claim.verdict_category)}`}
              >
                {claim.display_verdict}
              </span>
              <span
                className="claim-detail__score"
                title={
                  score === null
                    ? undefined
                    : `Exact score: ${score.toFixed(0)} / ${datasetStats.maxScorePoints} points`
                }
              >
                {scorePercentage === null
                  ? "Excluded from score"
                  : `${scorePercentage.toFixed(0)}%`}
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
                  <p>
                    {scoreExplanation(
                      score,
                      claim.exclusion_reason,
                      claim.verdict_category,
                    )}
                  </p>
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
                  <dt>Subject category</dt>
                  <dd>{claim.primary_domain}</dd>
                </div>
                {claim.public_discourse_category ? (
                  <div>
                    <dt>Topic category</dt>
                    <dd>{claim.public_discourse_category}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Organization or context</dt>
                  <dd>{claim.organization_or_domain}</dd>
                </div>
                {claim.relationship_to_organization ? (
                  <div>
                    <dt>Relationship to organization</dt>
                    <dd>{claim.relationship_to_organization}</dd>
                  </div>
                ) : null}
                {claim.assertion_mode ? (
                  <div>
                    <dt>Assertion mode</dt>
                    <dd>{claim.assertion_mode}</dd>
                  </div>
                ) : null}
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
                    {score === null
                      ? "Not scored"
                      : `${score} / ${datasetStats.maxScorePoints}`}
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
                {claim.correction_status ? (
                  <div>
                    <dt>Correction status</dt>
                    <dd>{claim.correction_status}</dd>
                  </div>
                ) : null}
                {claim.correction_date ? (
                  <div>
                    <dt>Correction date</dt>
                    <dd>{formatDate(claim.correction_date)}</dd>
                  </div>
                ) : null}
                {claim.deleted_after_challenge ? (
                  <div>
                    <dt>Deleted after challenge</dt>
                    <dd>{claim.deleted_after_challenge}</dd>
                  </div>
                ) : null}
                {claim.repeated_after_correction ? (
                  <div>
                    <dt>Repeated after correction</dt>
                    <dd>{claim.repeated_after_correction}</dd>
                  </div>
                ) : null}
                {claim.repetition_count ? (
                  <div>
                    <dt>Evidence-documented repetition count</dt>
                    <dd>{claim.repetition_count}</dd>
                  </div>
                ) : null}
                {sensitiveTopicTags.length > 0 ? (
                  <div>
                    <dt>Sensitive-topic metadata</dt>
                    <dd>{sensitiveTopicTags.join(" · ")}</dd>
                  </div>
                ) : null}
              </dl>
              {claim.sensitive_topic_note ? (
                <p className="detail-note">{claim.sensitive_topic_note}</p>
              ) : null}
            </section>

            <section className="detail-panel" aria-labelledby="intent-title">
              <p className="eyebrow">Intent stays separate</p>
              <h2 id="intent-title">Was intentional deception established?</h2>
              <p
                className={`intent-answer intent-answer--${
                  claim.intentional_deception_established === "Yes"
                    ? "established"
                    : claim.intentional_deception_established ===
                        "Not assessable"
                      ? "not-assessable"
                      : "not-established"
                }`}
              >
                {claim.intentional_deception_established}
              </p>
              <dl className="intent-details">
                <div>
                  <dt>Detailed assessment</dt>
                  <dd>{claim.deception_intent_status}</dd>
                </div>
                <div>
                  <dt>Intent evidence level</dt>
                  <dd>{claim.deception_intent_evidence_level} / 3</dd>
                </div>
              </dl>
              <p>{claim.deception_intent_rationale}</p>
              <p>
                “No” does not mean the statement was true. It means the cited
                evidence did not meet the higher standard needed to establish the
                speaker&apos;s state of mind.
              </p>
              {intentSources.length > 0 ? (
                <div className="intent-sources" aria-label="Intent evidence">
                  {intentSources.map((source, index) => (
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noreferrer"
                      key={`${source.href}-${index}`}
                    >
                      {source.title} <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              ) : null}
              <Link className="text-link" href="/methodology#intent">
                Why this distinction matters <span aria-hidden="true">→</span>
              </Link>
            </section>
          </div>

          <section
            className="evidence-strength"
            aria-labelledby="evidence-strength-title"
          >
            <div className="subsection-heading">
              <p className="eyebrow">Evidence strength</p>
              <h2 id="evidence-strength-title">
                A disclosed measure of evidence quality—not a probability.
              </h2>
              <p>
                Component scores measure source quality, corroboration, and
                directness. Verdict confidence begins with that evidence strength
                and applies the deductions documented in the methodology.
              </p>
            </div>
            <div className="evidence-strength__layout">
              <div className="evidence-strength__totals">
                <article>
                  <span>Evidence strength</span>
                  <strong>{claim.evidence_strength_score}</strong>
                  <small>of 100</small>
                </article>
                <article>
                  <span>Verdict confidence</span>
                  <strong>{claim.verdict_confidence_score}</strong>
                  <small>{claim.confidence}</small>
                </article>
              </div>
              <div className="evidence-components">
                {evidenceComponents.map((metric) => {
                  const value = Number(claim[metric.field] ?? 0);
                  const width =
                    metric.maximum === 0
                      ? 0
                      : Math.min(100, (value / metric.maximum) * 100);
                  return (
                    <div className="evidence-component" key={metric.field}>
                      <div>
                        <strong>{metric.label}</strong>
                        <span>
                          {value} / {metric.maximum}
                        </span>
                      </div>
                      <div
                        className="evidence-component__rail"
                        aria-hidden="true"
                      >
                        <span style={{ width: `${width}%` }} />
                      </div>
                      <p>{metric.definition}</p>
                    </div>
                  );
                })}
              </div>
              <dl className="evidence-strength__facts">
                <div>
                  <dt>Evidence sources</dt>
                  <dd>{claim.evidence_source_count}</dd>
                </div>
                <div>
                  <dt>Independent source domains</dt>
                  <dd>{claim.independent_source_domain_count}</dd>
                </div>
                <div>
                  <dt>Claim audit</dt>
                  <dd>{claim.evidence_audit_status}</dd>
                </div>
                {sourceAudit ? (
                  <div>
                    <dt>Source audit</dt>
                    <dd>{sourceAudit.source_audit_status}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
            {sourceAudit?.notes ? (
              <p className="fine-print evidence-strength__note">
                {sourceAudit.notes}
              </p>
            ) : null}
          </section>

          <section className="sources-section" aria-labelledby="sources-title">
            <div className="subsection-heading">
              <p className="eyebrow">Citations</p>
              <h2 id="sources-title">Read the underlying sources.</h2>
            </div>
            <div className="source-grid">
              {sources.map((source) => (
                <ExternalSource
                  href={source.href}
                  title={source.title}
                  label={source.label}
                  key={source.key}
                />
              ))}
            </div>
          </section>

          <section
            className="evaluation-audit"
            aria-labelledby="evaluation-audit-title"
          >
            <div className="subsection-heading">
              <p className="eyebrow">Field-level evaluation audit</p>
              <h2 id="evaluation-audit-title">
                Every calculated output carries its own evidence basis.
              </h2>
              <p>
                Open any of the {evaluationAudit.length} audited outputs to see
                its calculated value, written basis, rule, and cited sources.
              </p>
            </div>
            <div className="evaluation-audit__list">
              {evaluationAudit.map((row, index) => (
                <details
                  className="evaluation-audit__item"
                  key={row.metric_name}
                >
                  <summary>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>
                      <strong>{formatMetricName(row.metric_name)}</strong>
                      <small>{row.metric_value}</small>
                    </span>
                    <span aria-hidden="true">+</span>
                  </summary>
                  <div className="evaluation-audit__body">
                    <div>
                      <p className="eyebrow">Evidence basis</p>
                      <p>{row.evidence_basis}</p>
                    </div>
                    <div>
                      <p className="eyebrow">Calculation rule</p>
                      <p>{row.calculation_rule}</p>
                    </div>
                    <dl>
                      <div>
                        <dt>Evidence strength</dt>
                        <dd>{row.evidence_strength_score} / 100</dd>
                      </div>
                      <div>
                        <dt>Verdict confidence</dt>
                        <dd>
                          {row.verdict_confidence_score} / 100 ·{" "}
                          {row.confidence_band}
                        </dd>
                      </div>
                      <div>
                        <dt>Audit status</dt>
                        <dd>{row.audit_status}</dd>
                      </div>
                    </dl>
                    <div className="evaluation-audit__sources">
                      {auditSources(row, sourceTitleByUrl).map(
                        (source, sourceIndex) => (
                          <a
                            href={source.href}
                            target="_blank"
                            rel="noreferrer"
                            key={`${source.href}-${sourceIndex}`}
                          >
                            {source.title} <span aria-hidden="true">↗</span>
                          </a>
                        ),
                      )}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className="research-notes" aria-labelledby="research-notes-title">
            <div className="subsection-heading">
              <p className="eyebrow">Audit trail</p>
              <h2 id="research-notes-title">Selection and scoring notes.</h2>
            </div>
            <dl>
              <div>
                <dt>{datasetStats.versionLabel} classification rationale</dt>
                <dd>{claim.classification_rationale}</dd>
              </div>
              {migrationRow ? (
                <div>
                  <dt>{datasetStats.migrationLabel} audit</dt>
                  <dd>
                    {migrationRow.change_type || "Updated"}.{" "}
                    {migrationRow.change_note ||
                      "See the migration CSV for the row-level history."}
                  </dd>
                </div>
              ) : null}
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
