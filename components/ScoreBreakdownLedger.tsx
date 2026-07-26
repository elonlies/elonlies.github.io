import { subjectCategoryScores } from "@/lib/data";

type ScoreGroup = (typeof subjectCategoryScores)[number];

function GroupLedger({ groups }: { groups: ScoreGroup[] }) {
  return (
    <div className="score-breakdown-ledger">
      {groups.map((group) => (
        <div className="score-breakdown-row" key={group.name}>
          <div className="score-breakdown-row__label">
            <strong>{group.name}</strong>
            <span>
              {group.score === null
                ? "Not scored"
                : `${group.score.toFixed(1)}%`}{" "}
              · n={group.count} scored of {group.totalRecords}
            </span>
          </div>
          <div
            className="score-breakdown-row__rail"
            role="img"
            aria-label={
              group.score === null
                ? `${group.name}: not scored across ${group.totalRecords} tracked claims`
                : `${group.name}: ${group.score.toFixed(1)} percent across ${group.count} scored claims`
            }
          >
            <span style={{ width: `${group.score ?? 0}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SubjectCategoryLedger() {
  return <GroupLedger groups={subjectCategoryScores} />;
}
