"use client";

import { useState } from "react";
import type { YearlyTrend } from "@/lib/data";

const width = 960;
const height = 460;
const plot = {
  left: 62,
  right: 24,
  top: 28,
  bottom: 72,
};

function formatValue(value: number | null) {
  return value === null ? "Not scored" : `${value.toFixed(1)}%`;
}

export function YearlyTrendChart({
  trends,
  zeroPointLabel,
}: {
  trends: YearlyTrend[];
  zeroPointLabel: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const innerWidth = width - plot.left - plot.right;
  const innerHeight = height - plot.top - plot.bottom;
  const x = (index: number) =>
    plot.left + (index / Math.max(trends.length - 1, 1)) * innerWidth;
  const y = (value: number) =>
    plot.top + ((100 - value) / 100) * innerHeight;

  const trustPath = (() => {
    let path = "";
    let segmentOpen = false;
    trends.forEach((trend, index) => {
      if (trend.score === null) {
        segmentOpen = false;
        return;
      }
      path += `${segmentOpen ? "L" : "M"} ${x(index)} ${y(trend.score)} `;
      segmentOpen = true;
    });
    return path.trim();
  })();

  const falsePath = trends
    .map(
      (trend, index) =>
        `${index === 0 ? "M" : "L"} ${x(index)} ${y(trend.falseShare)}`,
    )
    .join(" ");

  const active = activeIndex === null ? null : trends[activeIndex];

  return (
    <div className="trend-chart">
      <div className="trend-chart__legend" aria-hidden="true">
        <span>
          <i className="trend-chart__swatch trend-chart__swatch--score" />
          Annual Trust Score
        </span>
        <span>
          <i className="trend-chart__swatch trend-chart__swatch--false" />
          {zeroPointLabel} share of tracked records
        </span>
      </div>
      <svg
        className="trend-chart__plot"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby="annual-trend-title annual-trend-description"
        onPointerLeave={() => setActiveIndex(null)}
      >
        <title id="annual-trend-title">
          Annual Trust Score and {zeroPointLabel} share by statement year
        </title>
        <desc id="annual-trend-description">
          Two percentage lines from {trends.at(0)?.year ?? "the first year"} through{" "}
          {trends.at(-1)?.year ?? "the last year"}. Point details and sample sizes
          are available by hovering, with a complete data table below.
        </desc>

        {[0, 25, 50, 75, 100].map((tick) => (
          <g key={tick}>
            <line
              x1={plot.left}
              x2={width - plot.right}
              y1={y(tick)}
              y2={y(tick)}
              className="trend-chart__gridline"
            />
            <text
              x={plot.left - 12}
              y={y(tick) + 4}
              textAnchor="end"
              className="trend-chart__axis-label"
            >
              {tick}%
            </text>
          </g>
        ))}

        {trends.map((trend, index) => (
          <text
            x={x(index)}
            y={height - 38}
            textAnchor="middle"
            className={`trend-chart__axis-label trend-chart__year-label${
              index % 3 !== 0 && index !== trends.length - 1
                ? " trend-chart__year-label--dense"
                : ""
            }`}
            key={trend.year}
          >
            {trend.year.slice(2)}
          </text>
        ))}
        <text
          x={plot.left}
          y={height - 10}
          className="trend-chart__axis-title"
        >
          Statement year · labels show the final two digits
        </text>

        <path d={trustPath} className="trend-chart__line trend-chart__line--score" />
        <path d={falsePath} className="trend-chart__line trend-chart__line--false" />

        {activeIndex !== null ? (
          <line
            x1={x(activeIndex)}
            x2={x(activeIndex)}
            y1={plot.top}
            y2={plot.top + innerHeight}
            className="trend-chart__guide"
          />
        ) : null}

        {trends.map((trend, index) => (
          <g
            key={`${trend.year}-points`}
            onPointerEnter={() => setActiveIndex(index)}
            onPointerDown={() => setActiveIndex(index)}
          >
            <rect
              x={x(index) - innerWidth / trends.length / 2}
              y={plot.top}
              width={innerWidth / trends.length}
              height={innerHeight}
              className="trend-chart__hit-area"
            />
            {trend.score === null ? null : (
              <circle
                cx={x(index)}
                cy={y(trend.score)}
                r={activeIndex === index ? 6 : 4}
                className="trend-chart__point trend-chart__point--score"
              />
            )}
            <rect
              x={x(index) - (activeIndex === index ? 6 : 4)}
              y={y(trend.falseShare) - (activeIndex === index ? 6 : 4)}
              width={activeIndex === index ? 12 : 8}
              height={activeIndex === index ? 12 : 8}
              className="trend-chart__point trend-chart__point--false"
            />
            <title>
              {trend.year}: Trust Score {formatValue(trend.score)}; {zeroPointLabel}{" "}
              share {trend.falseShare.toFixed(1)}%; {trend.falseCount}{" "}
              {zeroPointLabel} of{" "}
              {trend.total} tracked records.
            </title>
          </g>
        ))}
      </svg>

      <p className="trend-chart__detail" aria-live="polite">
        {active ? (
          <>
            <strong>{active.year}</strong>: Trust Score{" "}
            {formatValue(active.score)} from {active.scored} scored claims;{" "}
            {active.falseCount} of {active.total} tracked records were{" "}
            {zeroPointLabel} ({active.falseShare.toFixed(1)}%).
          </>
        ) : (
          <>
            Hover or tap a year for its exact score, {zeroPointLabel} count, and sample
            size.
          </>
        )}
      </p>

      <details className="trend-chart__table">
        <summary>View the annual data table</summary>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Tracked</th>
                <th>Scored</th>
                <th>Trust Score</th>
                <th>{zeroPointLabel}</th>
                <th>{zeroPointLabel} share</th>
              </tr>
            </thead>
            <tbody>
              {trends.map((trend) => (
                <tr key={`${trend.year}-table`}>
                  <th scope="row">{trend.year}</th>
                  <td>{trend.total}</td>
                  <td>{trend.scored}</td>
                  <td>{formatValue(trend.score)}</td>
                  <td>{trend.falseCount}</td>
                  <td>{trend.falseShare.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
