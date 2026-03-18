import React from 'react';

const ScoreRing = ({ score, color }) => {
  const radius = 22;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;

  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="4" />
      <circle
        cx="28"
        cy="28"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="28" y="33" textAnchor="middle" fontSize="12" fontWeight="700" fill={color}>
        {score}
      </text>
    </svg>
  );
};

const RiskBadge = ({ level, color }) => (
  <span
    className="risk-badge"
    style={{
      background: `${color}22`,
      color: color,
      border: `1px solid ${color}55`,
    }}
  >
    {level === 'Low' && '✅ '}
    {level === 'Medium' && '⚠️ '}
    {level === 'High' && '🚨 '}
    {level} Risk
  </span>
);

function RouteCard({ route, isBest, isActive, onClick }) {
  const { safety } = route;
  const color = safety?.color || '#6b7280';

  return (
    <div
      className={`route-card ${isActive ? 'route-card--active' : ''}`}
      onClick={onClick}
      style={{ '--card-accent': color }}
    >
      {/* Top row */}
      <div className="rc-top">
        <div className="rc-name-wrap">
          <span className="rc-name">{route.route_name}</span>
          <div className="rc-badges">
            {isBest && <span className="badge-best">🏆 Best</span>}
            {isActive && <span className="badge-active">👁 Viewing</span>}
          </div>
        </div>
        <ScoreRing score={safety?.score ?? 0} color={color} />
      </div>

      {/* Stats row */}
      <div className="rc-stats">
        <div className="rc-stat">
          <span className="rc-stat-icon">📏</span>
          <div>
            <div className="rc-stat-val">{route.distance}</div>
            <div className="rc-stat-lbl">Distance</div>
          </div>
        </div>
        <div className="rc-divider" />
        <div className="rc-stat">
          <span className="rc-stat-icon">⏱</span>
          <div>
            <div className="rc-stat-val">{route.duration}</div>
            <div className="rc-stat-lbl">Duration</div>
          </div>
        </div>
        <div className="rc-divider" />
        <div className="rc-stat">
          <span className="rc-stat-icon">🛡️</span>
          <div>
            <div className="rc-stat-val">{safety?.score ?? 'N/A'}/100</div>
            <div className="rc-stat-lbl">Safety</div>
          </div>
        </div>
      </div>

      {/* Risk badge */}
      <div className="rc-risk-row">
        <RiskBadge level={safety?.level ?? 'Unknown'} color={color} />
      </div>

      {/* Warnings */}
      {route.warnings?.length > 0 && (
        <div className="rc-warnings">
          {route.warnings.map((w, i) => (
            <div key={i} className="rc-warning-item">
              ⚠️ {w}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RouteCard;
