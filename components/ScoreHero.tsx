import Link from "next/link";

type ScoreHeroProps = {
  compact?: boolean;
};

export function ScoreHero({ compact = false }: ScoreHeroProps) {
  return (
    <Link
      className={`score-hero${compact ? " score-hero--compact" : ""}`}
      href="/score"
      aria-label="Trust Score 33 out of 100, not trustworthy. View the evidence and calculation."
    >
      <div className="score-hero__label-row">
        <span className="eyebrow">Elon Musk Trust Score</span>
        <span className="provisional-tag">Provisional</span>
      </div>
      <div className="score-hero__number" aria-hidden="true">
        <span>33</span>
        <span className="score-hero__denominator">/100</span>
      </div>
      <div className="score-hero__conclusion">Not trustworthy</div>
      <p className="score-hero__scope">
        Based on 81 source-backed, manually scored public claims and promises.
        Nineteen pending, unclear, or otherwise excluded records remain visible.
      </p>
      <span className="text-link score-hero__link">
        See exactly how this was calculated <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
