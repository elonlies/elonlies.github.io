"use client";

import { useMemo, useState } from "react";

const scoreGroups = [
  {
    id: "full",
    label: "Accurate or fully fulfilled",
    count: 11,
    published: 100,
  },
  {
    id: "strong",
    label: "Strong partial or slightly late",
    count: 13,
    published: 75,
  },
  {
    id: "material",
    label: "Material partial or substantially late",
    count: 11,
    published: 50,
  },
  {
    id: "weak",
    label: "Weak partial delivery",
    count: 1,
    published: 25,
  },
  {
    id: "failed",
    label: "False, reversed, or unfulfilled",
    count: 45,
    published: 0,
  },
];

export function WeightCalculator() {
  const [weights, setWeights] = useState<Record<string, number>>(
    Object.fromEntries(scoreGroups.map((group) => [group.id, group.published])),
  );

  const score = useMemo(() => {
    const points = scoreGroups.reduce(
      (total, group) => total + group.count * (weights[group.id] / 100),
      0,
    );
    return (points / 81) * 100;
  }, [weights]);

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
          <small>/100</small>
        </div>
        <div>
          <span>Published score</span>
          <strong>32.7</strong>
          <small>/100</small>
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
