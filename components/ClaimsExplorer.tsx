"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ClaimIndexRecord } from "@/lib/data";

type ClaimsExplorerProps = {
  claims: ClaimIndexRecord[];
  maxScorePoints: number;
  verdictTones: Record<string, string>;
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
  { value: "category", label: "Subject category" },
];

function compareStatementDates(
  left: ClaimIndexRecord,
  right: ClaimIndexRecord,
  direction: "ascending" | "descending",
) {
  const leftIsDated = /^\d{4}/.test(left.statement_date);
  const rightIsDated = /^\d{4}/.test(right.statement_date);
  if (leftIsDated !== rightIsDated) return leftIsDated ? -1 : 1;
  const comparison = left.statement_date.localeCompare(right.statement_date);
  return direction === "ascending" ? comparison : -comparison;
}

function claimScore(claim: ClaimIndexRecord) {
  if (
    claim.include_in_trust_score !== "Yes" ||
    claim.score_points === ""
  ) {
    return null;
  }
  return Number(claim.score_points);
}

function claimTypeGroup(type: string) {
  return type;
}

function formatVerdict(verdict: string) {
  return verdict.replaceAll("_", " ");
}

function formatDate(value: string) {
  if (/^\d{4}$/.test(value)) return value;
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, month - 1, 1)));
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, month - 1, day)));
  }
  return value;
}

export function ClaimsExplorer({
  claims,
  maxScorePoints,
  verdictTones,
}: ClaimsExplorerProps) {
  const subjectCategories = useMemo(
    () =>
      [...new Set(claims.map((claim) => claim.primary_domain))].sort(),
    [claims],
  );
  const organizationContexts = useMemo(
    () =>
      [
        ...new Set(
          claims
            .map((claim) => claim.organization_or_domain)
            .filter((context): context is string => Boolean(context)),
        ),
      ].sort(),
    [claims],
  );
  const topicCategories = useMemo(
    () =>
      [
        ...new Set(
          claims
            .map((claim) => claim.public_discourse_category)
            .filter((category): category is string => Boolean(category)),
        ),
      ].sort(),
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
  const [category, setCategory] = useState("all");
  const [context, setContext] = useState("all");
  const [topicCategory, setTopicCategory] = useState("all");
  const [verdict, setVerdict] = useState("all");
  const [type, setType] = useState("all");
  const [scope, setScope] = useState("all");
  const [sort, setSort] = useState("oldest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const queryReady = useRef(false);
  const resultsHeaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get("q") ?? "");
      setCategory(params.get("category") ?? params.get("domain") ?? "all");
      setContext(
        params.get("context") ??
          params.get("entity") ??
          params.get("legacy_context") ??
          params.get("org") ??
          "all",
      );
      setTopicCategory(
        params.get("topic") ?? params.get("discourse") ?? "all",
      );
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
    if (category !== "all") params.set("category", category);
    if (context !== "all") params.set("context", context);
    if (topicCategory !== "all") params.set("topic", topicCategory);
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
  }, [
    category,
    context,
    scope,
    search,
    sort,
    topicCategory,
    type,
    verdict,
  ]);

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
        claim.relationship_to_organization,
        claim.public_discourse_category,
        claim.assertion_mode,
        claim.correction_status,
        claim.sensitive_topic_tags,
        claim.intentional_deception_established,
        claim.deception_intent_status,
        claim.strict_promise_result,
      ]
        .join(" ")
        .toLowerCase();

      if (query && !searchable.includes(query)) return false;
      if (category !== "all" && claim.primary_domain !== category) return false;
      if (
        context !== "all" &&
        claim.organization_or_domain !== context
      ) {
        return false;
      }
      if (
        topicCategory !== "all" &&
        claim.public_discourse_category !== topicCategory
      ) {
        return false;
      }
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
      if (sort === "newest") {
        return compareStatementDates(a, b, "descending");
      }
      if (sort === "score-low") {
        return (claimScore(a) ?? Number.POSITIVE_INFINITY) -
          (claimScore(b) ?? Number.POSITIVE_INFINITY);
      }
      if (sort === "score-high") {
        return (claimScore(b) ?? Number.NEGATIVE_INFINITY) -
          (claimScore(a) ?? Number.NEGATIVE_INFINITY);
      }
      if (sort === "category") {
        const secondaryA =
          a.public_discourse_category || a.organization_or_domain || a.topic;
        const secondaryB =
          b.public_discourse_category || b.organization_or_domain || b.topic;
        return (
          a.primary_domain.localeCompare(b.primary_domain) ||
          secondaryA.localeCompare(secondaryB) ||
          a.statement_date.localeCompare(b.statement_date)
        );
      }
      return compareStatementDates(a, b, "ascending");
    });
  }, [
    category,
    claims,
    context,
    scope,
    search,
    sort,
    topicCategory,
    type,
    verdict,
  ]);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setContext("all");
    setTopicCategory("all");
    setVerdict("all");
    setType("all");
    setScope("all");
    setSort("oldest");
    setFiltersOpen(false);
  };

  const activeFilters = [
    category === "all"
      ? null
      : {
          key: "category",
          label: `Subject: ${category}`,
          clear: () => setCategory("all"),
        },
    topicCategory === "all"
      ? null
      : {
          key: "topic",
          label: `Topic: ${topicCategory}`,
          clear: () => setTopicCategory("all"),
        },
    context === "all"
      ? null
      : {
          key: "context",
          label: `Context: ${context}`,
          clear: () => setContext("all"),
        },
    verdict === "all"
      ? null
      : {
          key: "verdict",
          label: `Verdict: ${formatVerdict(verdict)}`,
          clear: () => setVerdict("all"),
        },
    type === "all"
      ? null
      : {
          key: "type",
          label: `Type: ${type}`,
          clear: () => setType("all"),
        },
    scope === "all"
      ? null
      : {
          key: "scope",
          label:
            scopeOptions.find((option) => option.value === scope)?.label ??
            scope,
          clear: () => setScope("all"),
        },
    sort === "oldest"
      ? null
      : {
          key: "sort",
          label:
            `Sort: ${
              sortOptions.find((option) => option.value === sort)?.label ??
              sort
            }`,
          clear: () => setSort("oldest"),
        },
  ].filter((filter) => filter !== null);
  const hasActiveRefinements =
    search.trim() !== "" || activeFilters.length > 0;

  const showMobileResults = () => {
    setFiltersOpen(false);
    window.requestAnimationFrame(() => {
      resultsHeaderRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    });
  };

  return (
    <div className="claims-explorer">
      <div
        className={`claims-filters${filtersOpen ? " claims-filters--open" : ""}`}
        aria-label="Filter claim records"
      >
        <label className="search-field">
          <span>Search the evidence</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Claim, topic, subject, context, or record ID"
          />
        </label>
        <button
          className="mobile-filter-toggle"
          type="button"
          aria-expanded={filtersOpen}
          aria-controls="claim-filter-options"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <span>
            Filters &amp; sort
            {activeFilters.length > 0 ? (
              <strong>{activeFilters.length}</strong>
            ) : null}
          </span>
          <span className="mobile-filter-toggle__icon" aria-hidden="true">
            {filtersOpen ? "−" : "+"}
          </span>
        </button>
        {!filtersOpen && activeFilters.length > 0 ? (
          <div className="mobile-active-filters" aria-label="Active filters">
            {activeFilters.map((filter) => (
              <button type="button" key={filter.key} onClick={filter.clear}>
                <span>{filter.label}</span>
                <span aria-hidden="true">×</span>
                <span className="sr-only">Remove {filter.label} filter</span>
              </button>
            ))}
          </div>
        ) : null}
        <div className="filter-grid" id="claim-filter-options">
          <label>
            <span>Subject category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">All subject categories</option>
              {subjectCategories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          {topicCategories.length > 0 ? (
            <label>
              <span>Topic category</span>
              <select
                value={topicCategory}
                onChange={(event) => setTopicCategory(event.target.value)}
              >
                <option value="all">All topic categories</option>
                {topicCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {organizationContexts.length > 0 ? (
            <label>
              <span>Organization or context</span>
              <select
                value={context}
                onChange={(event) => setContext(event.target.value)}
              >
                <option value="all">All organizations and contexts</option>
                {organizationContexts.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
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
          <div className="mobile-filter-footer">
            <button
              className="button"
              type="button"
              onClick={showMobileResults}
            >
              Show {filteredClaims.length} result
              {filteredClaims.length === 1 ? "" : "s"}
            </button>
            {hasActiveRefinements ? (
              <button
                className="text-button"
                type="button"
                onClick={clearFilters}
              >
                Clear all
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="claims-results-header" ref={resultsHeaderRef}>
        <p aria-live="polite">
          Showing <strong>{filteredClaims.length}</strong> of {claims.length} claims
        </p>
        <div className="claims-results-header__actions">
          <button className="text-button" type="button" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      </div>

      {filteredClaims.length > 0 ? (
        <ol className="claims-list">
          {filteredClaims.map((claim) => {
            const score = claimScore(claim);
            const scorePercentage =
              score === null
                ? null
                : (score / maxScorePoints) * 100;
            return (
              <li key={claim.record_id}>
                <article className="claim-row">
                  <div className="claim-row__meta">
                    <span className="record-id">{claim.record_id}</span>
                    <span>{formatDate(claim.statement_date)}</span>
                    <span>{claim.primary_domain}</span>
                    {claim.public_discourse_category ? (
                      <span>{claim.public_discourse_category}</span>
                    ) : null}
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
                        className={`verdict-chip verdict-${
                          verdictTones[claim.verdict_category] ?? "mixed"
                        }`}
                        title={`Canonical category: ${formatVerdict(claim.verdict_category)}`}
                      >
                        {claim.display_verdict}
                      </span>
                      <strong
                        title={
                          score === null
                            ? undefined
                            : `Exact score: ${score} / ${maxScorePoints} points`
                        }
                      >
                        {scorePercentage === null
                          ? "Excluded"
                          : `${scorePercentage.toFixed(0)}%`}
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
