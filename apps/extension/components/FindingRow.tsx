import type { RiskFinding } from '@plumb/core';

export function FindingRow({ finding }: { finding: RiskFinding }) {
  return (
    <div className={`plumb-finding plumb-finding-${finding.severity}`}>
      <div className="plumb-finding-title">{finding.title}</div>
      <div className="plumb-finding-detail">{finding.detail}</div>
    </div>
  );
}
