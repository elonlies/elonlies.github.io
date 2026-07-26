"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  claimScore,
  claimTypeGroup,
  formatDate,
  formatVerdict,
  type Claim,
  verdictTone,
} from "@/lib/data";

type ClaimsExplorerProps = {
  claims: Claim[];
};

const scopeOptions = [
  { value: "all", label: "All records" },
  { value: "included", label: "Included in score" },
  { value: "excluded", label: "Excluded from score" },
];

const sortOptions = [
  { value: "oldest", label: "Oldest first" },
  { value: "newest", label: "Newest first" },
  { value: "score-low", label: "Score: low to high" },
  { value: "score-high", label: "Score: high to low" },
  { value: "organization", label: "Organization" },
];

export function ClaimsExplorer({ claims }: ClaimsExplorerProps) {
  const organizations = useMemo(
    () =>
      [...new Set(claims.map((claim) => claim.organization_or_domain))].sort(),
    [claims],
  );
  const domains = useMemo(
    () => [...new Set(claims.map((claim) => claim.primary_domain))].sort(),
    [claims],
  );
  const verdicts = useMemo(
    () => [...new Set(claims.map((claim) => claim.verdict_category))],
    [claims],
  );
  const types = useMemo(
    () => [...new Set(claims.map((claim) => claimTypeGroup(claim.claim_type)))].sort(),
    [claims],
  );

  const [search, setSearch] = useState("");
  const [organization, setOrganization] = useState("all");
  const [domain, setDomain] = useState("all");
  const [verdict, setVerdict] = useState("all");
  const [type, setType] = useState("all");
  const [scope, setScope] = useState("all");
  const [sort, setSort] = useState("oldest");
  const queryReady = useRef(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get("q") ?? "");
      setOrganization(params.get("org") ?? "all");
      setDomain(params.get("domain") ?? "all");
      setVerdict(params.get("verdict") ?? "all");
      setType(params.get("type") ?? "all");
      setScope(params.get("scope") ?? "all");
      setSort(params.get("sort") ?? "oldest");
      queryReady.current = true;
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!queryReady.current) return;
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (organization !== "all") params.set("org", organization);
    if (domain !== "all") params.set("domain", domain);
    if (verdict !== "all") params.set("verdict", verdict);
    if (type !== "all") params.set("type", type);
    if (scope !== "all") params.set("scope", scope);
    if (sort !== "oldest") params.set("sort", sort);
    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
    );
  }, [domain, organization, scope, search, sort, type, verdict]);

  const filteredClaims = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = claims.filter((claim) => {
      const searchable = [
        claim.record_id,
        claim.statement_paraphrase,
        claim.outcome_summary,
        claim.topic,
        claim.organization_or_domain,
        claim.primary_domain,
        claim.verdict_category,
        claim.display_verdict,
        claim.related_entity,
        claim.relationship_to_entity,
        claim.public_discourse_category,
        claim.assertion_mode,
        claim.correction_status,
      ]
        .join(" ")
        .toLowerCase();

      if (query && !searchable.includes(query)) return false;
      if (
        organization !== "all" &&
        claim.organization_or_domain !== organization
      ) {
        return false;
      }
      if (domain !== "all" && claim.primary_domain !== domain) return false;
      if (verdict !== "all" && claim.verdict_category !== verdict) return false;
      if (type !== "all" && claimTypeGroup(claim.claim_type) !== type) {
        return false;
      }
      if (
        scope === "included" &&
        claim.include_in_trust_score !== "Yes"
      ) {
        return false;
      }
      if (
        scope === "excluded" &&
        claim.include_in_trust_score === "Yes"
      ) {
        return false;
      }
      return true;
    });

    return result.sort((a, b) => {
      if (sort === "newest") return b.statement_date.localeCompare(a.statement_date);
      if (sort === "score-low") {
        return (claimScore(a) ?? Number.POSITIVE_INFINITY) -
          (claimScore(b) ?? Number.POSITIVE_INFINITY);
      }
      if (sort === "score-high") {
        return (claimScore(b) ?? Number.NEGATIVE_INFINITY) -
          (claimScore(a) ?? Number.NEGATIVE_INFINITY);
      }
      if (sort === "organization") {
        return (
          a.organization_or_domain.localeCompare(b.organization_or_domain) ||
          a.statement_date.localeCompare(b.statement_date)
        );
      }
      return a.statement_date.localeCompare(b.statement_date);
    });
  }, [claims, domain, organization, scope, search, sort, type, verdict]);

  const clearFilters = () => {
    setSearch("");
    setOrganization("all");
    setDomain("all");
    setVerdict("all");
    setType("all");
    setScope("all");
    setSort("oldest");
  };

  return (
    <div className="claims-explorer">
      <div className="claims-filters" aria-label="Filter claim records">
        <label className="search-field">
          <span>Search the evidence</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Claim, outcome, topic, or record ID"
          />
        </label>
        <div className="filter-grid">
          <label>
            <span>Organization</span>
            <select
              value={organization}
              onChange={(event) => setOrganization(event.target.value)}
            >
              <option value="all">All organizations</option>
              {organizations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Primary domain</span>
            <select
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
            >
              <option value="all">All domains</option>
              {domains.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Verdict</span>
            <select
              value={verdict}
              onChange={(event) => setVerdict(event.target.value)}
            >
              <option value="all">All verdicts</option>
              {verdicts.map((item) => (
                <option key={item} value={item}>
                  {formatVerdict(item)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Claim type</span>
            <select value={type} onChange={(event) => setType(event.target.value)}>
              <option value="all">All claim types</option>
              {types.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Score scope</span>
            <select
              value={scope}
              onChange={(event) => setScope(event.target.value)}
            >
              {scopeOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Sort</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              {sortOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="claims-results-header">
        <p aria-live="polite">
          Showing <strong>{filteredClaims.length}</strong> of {claims.length} claims
        </p>
        <button className="text-button" type="button" onClick={clearFilters}>
          Clear filters
        </button>
      </div>

      {filteredClaims.length > 0 ? (
        <ol className="claims-list">
          {filteredClaims.map((claim) => {
            const score = claimScore(claim);
            return (
              <li key={claim.record_id}>
                <article className="claim-row">
                  <div className="claim-row__meta">
                    <span className="record-id">{claim.record_id}</span>
                    <span>{formatDate(claim.statement_date)}</span>
                    <span>{claim.organization_or_domain}</span>
                    <span>{claimTypeGroup(claim.claim_type)}</span>
                  </div>
                  <div className="claim-row__body">
                    <div>
                      <h3>
                        <Link href={`/claims/${claim.record_id}`}>
                          {claim.statement_paraphrase}
                        </Link>
                      </h3>
                      <p>{claim.outcome_summary}</p>
                    </div>
                    <div className="claim-row__verdict">
                      <span
                        className={`verdict-chip verdict-${verdictTone(claim.verdict_category)}`}
                        title={`Canonical category: ${formatVerdict(claim.verdict_category)}`}
                      >
                        {claim.display_verdict}
                      </span>
                      <strong>
                        {score === null ? "Excluded" : `${score.toFixed(0)} / 100`}
                      </strong>
                    </div>
                  </div>
                  <Link className="claim-row__open" href={`/claims/${claim.record_id}`}>
                    Open evidence record <span aria-hidden="true">→</span>
                  </Link>
                </article>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="empty-state">
          <h3>No claims match these filters.</h3>
          <p>Try a broader search or clear the current filters.</p>
          <button className="button button--secondary" type="button" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
