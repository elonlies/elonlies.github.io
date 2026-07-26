import {
  datasetStats,
  formatVerdict,
  outcomeDistribution,
  verdictTone,
} from "@/lib/data";

export function OutcomeLedger() {
  return (
    <div className="outcome-ledger">
      <div
        className="outcome-strip"
        role="img"
        aria-label={`Distribution of all ${datasetStats.totalRecords} verdicts. Exact counts follow.`}
      >
        {outcomeDistribution.map((outcome) => (
          <span
            className={`outcome-strip__segment verdict-${verdictTone(outcome.key)}`}
            key={outcome.key}
            style={{
              width: `${(outcome.count / datasetStats.totalRecords) * 100}%`,
            }}
            title={`${formatVerdict(outcome.key)}: ${outcome.count}`}
          />
        ))}
      </div>
      <dl className="outcome-list">
        {outcomeDistribution.map((outcome) => (
          <div key={outcome.key}>
            <dt>
              <span
                className={`outcome-dot verdict-${verdictTone(outcome.key)}`}
                aria-hidden="true"
              />
              {formatVerdict(outcome.key)}
            </dt>
            <dd>{outcome.count}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
