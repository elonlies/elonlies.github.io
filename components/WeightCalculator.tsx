"use client";

import { useMemo, useState } from "react";

type ScoreGroup = {
  id: string;
  label: string;
  count: number;
  published: number;
};

export function WeightCalculator({
  scoreGroups,
  scoredClaimCount,
  publishedScore,
}: {
  scoreGroups: ScoreGroup[];
  scoredClaimCount: number;
  publishedScore: number;
}) {
  const [weights, setWeights] = useState<Record<string, number>>(
    Object.fromEntries(scoreGroups.map((group) => [group.id, group.published])),
  );

  const score = useMemo(() => {
    const points = scoreGroups.reduce(
      (total, group) => total + group.count * (weights[group.id] / 100),
      0,
    );
    return (points / scoredClaimCount) * 100;
  }, [scoreGroups, scoredClaimCount, weights]);

  const reset = () => {
    setWeights(
      Object.fromEntries(scoreGroups.map((group) => [group.id, group.published])),
    );
  };

  return (
    <div className="calculator">
      <div className="calculator__result" aria-live="polite">
        <div>
          <span>Your weighting</span>
          <strong>{score.toFixed(1)}</strong>
          <small>%</small>
        </div>
        <div title={`Published fraction: 2,950 / 8,300 points`}>
          <span>Published score</span>
          <strong>{publishedScore.toFixed(1)}</strong>
          <small>%</small>
        </div>
      </div>
      <div className="calculator__controls">
        {scoreGroups.map((group) => (
          <label key={group.id} className="weight-control">
            <span className="weight-control__label">
              <span>
                {group.label}
                <small>{group.count} scored claims</small>
              </span>
              <output htmlFor={`weight-${group.id}`}>
                {weights[group.id]} points
              </output>
            </span>
            <input
              id={`weight-${group.id}`}
              type="range"
              min="0"
              max="100"
              step="5"
              value={weights[group.id]}
              onChange={(event) =>
                setWeights((current) => ({
                  ...current,
                  [group.id]: Number(event.target.value),
                }))
              }
            />
          </label>
        ))}
      </div>
      <div className="calculator__footer">
        <p>
          This changes only the point weights. It does not reclassify any verdict or
          add excluded claims.
        </p>
        <button type="button" className="text-button" onClick={reset}>
          Reset published weights
        </button>
      </div>
    </div>
  );
}
