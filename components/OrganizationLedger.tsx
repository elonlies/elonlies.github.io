import { organizationScores } from "@/lib/data";

export function OrganizationLedger() {
  return (
    <div className="organization-ledger">
      {organizationScores.map((organization) => (
        <div className="organization-row" key={organization.name}>
          <div className="organization-row__label">
            <strong>{organization.name}</strong>
            <span>
              {organization.score.toFixed(1)}% · n={organization.count}
            </span>
          </div>
          <div
            className="organization-row__rail"
            role="img"
            aria-label={`${organization.name}: ${organization.score.toFixed(1)} percent across ${organization.count} scored claims`}
          >
            <span style={{ width: `${organization.score}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
