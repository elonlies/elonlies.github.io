import { domainScores, organizationScores } from "@/lib/data";

type ScoreGroup = (typeof organizationScores)[number];

function GroupLedger({ groups }: { groups: ScoreGroup[] }) {
  return (
    <div className="organization-ledger">
      {groups.map((group) => (
        <div className="organization-row" key={group.name}>
          <div className="organization-row__label">
            <strong>{group.name}</strong>
            <span>
              {group.score.toFixed(1)}% · n={group.count} scored of{" "}
              {group.totalRecords}
            </span>
          </div>
          <div
            className="organization-row__rail"
            role="img"
            aria-label={`${group.name}: ${group.score.toFixed(1)} percent across ${group.count} scored claims`}
          >
            <span style={{ width: `${group.score}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrganizationLedger() {
  return <GroupLedger groups={organizationScores} />;
}

export function DomainLedger() {
  return <GroupLedger groups={domainScores} />;
}
