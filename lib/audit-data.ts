import rawEvaluationAudit from "@/generated-data/evaluation-audit.json";
import rawSourceAudit from "@/generated-data/source-audit.json";

export type EvaluationAuditRow = {
  record_id: string;
  metric_name: string;
  metric_value: string;
  evidence_basis: string;
  evidence_urls: string;
  evidence_titles: string;
  calculation_rule: string;
  evidence_strength_score: string;
  verdict_confidence_score: string;
  confidence_band: string;
  audit_status: string;
};

export type SourceAuditRow = {
  record_id: string;
  statement_source_url: string;
  statement_source_title: string;
  statement_source_tier: string;
  statement_evidence_quality_score: string;
  outcome_source_1_url: string;
  outcome_source_1_title: string;
  outcome_source_2_url: string;
  outcome_source_2_title: string;
  outcome_evidence_quality_score: string;
  corroboration_score: string;
  directness_score: string;
  evidence_strength_score: string;
  verdict_confidence_score: string;
  confidence: string;
  evidence_source_count: string;
  independent_source_domain_count: string;
  credible_sources_contest_claim: string;
  source_audit_status: string;
  notes: string;
};

type EvaluationAuditIndex = Record<string, EvaluationAuditRow[]>;
type SourceAuditIndex = Record<string, SourceAuditRow>;

const evaluationAudit = rawEvaluationAudit as EvaluationAuditIndex;
const sourceAudit = rawSourceAudit as SourceAuditIndex;

export function findEvaluationAudit(recordId: string) {
  return evaluationAudit[recordId] ?? [];
}

export function findSourceAudit(recordId: string) {
  return sourceAudit[recordId] ?? null;
}

export function splitAuditValues(value: string) {
  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function auditSources(
  row: EvaluationAuditRow,
  knownTitles?: ReadonlyMap<string, string>,
) {
  const urls = splitAuditValues(row.evidence_urls);
  const titles = splitAuditValues(row.evidence_titles);
  const titlesAlignWithUrls = titles.length === urls.length;

  return urls.map((href, index) => ({
    href,
    title:
      knownTitles?.get(href) ||
      (titlesAlignWithUrls ? titles[index] : "") ||
      `Evidence source ${index + 1}`,
  }));
}
