import Link from "next/link";
import { datasetStats } from "@/lib/data";

type ScoreHeroProps = {
  compact?: boolean;
};

export function ScoreHero({ compact = false }: ScoreHeroProps) {
  const exactCalculation = `${datasetStats.pointsEarned.toLocaleString("en-US")} / ${datasetStats.pointsPossible.toLocaleString("en-US")} points = ${datasetStats.exactScore}%`;

  return (
    <Link
      className={`score-hero${compact ? " score-hero--compact" : ""}`}
      href="/score"
      aria-label={`Trust Score ${datasetStats.roundedScore} percent, ${datasetStats.conclusion.toLowerCase()}. Exact calculation: ${exactCalculation}. View the evidence and calculation.`}
    >
      <div className="score-hero__label-row">
        <span className="eyebrow">Elon Musk Trust Score</span>
        <span className="provisional-tag">Provisional</span>
      </div>
      <div
        className="score-hero__number"
        aria-hidden="true"
        title={`Exact calculation: ${exactCalculation}`}
      >
        <span>{datasetStats.roundedScore}</span>
        <span className="score-hero__denominator">%</span>
      </div>
      <div className="score-hero__conclusion">{datasetStats.conclusion}</div>
      <p className="score-hero__scope">
        Based on {datasetStats.scoredClaims} source-backed, manually scored public
        claims, forecasts, and promises. {datasetStats.excludedClaims} pending or
        unresolved records remain visible.
      </p>
      <span className="text-link score-hero__link">
        See exactly how this was calculated <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
