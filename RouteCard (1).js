import React from 'react';
import './RouteCard.css';

/* Circular SVG progress ring */
function ScoreRing({ score, color }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  return (
    <svg className="score-ring" width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r={r} fill="none" stroke="#f0f0f5" strokeWidth="4" />
      <circle
        cx="26" cy="26" r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
        style={{ transition: 'stroke-dasharray 0.55s ease' }}
      />
      <text x="26" y="31" textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>
        {score}
      </text>
    </svg>
  );
}

function RouteCard({ route, isBest, isActive, onClick }) {
  const { safety } = route;
  const color = safety?.color || '#aeaeb2';

  return (
    <div
      className={`route-card ${isBest ? 'route-card--best' : ''} ${isActive ? 'route-card--active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-pressed={isActive}
    >
      {/* Best Route ribbon */}
      {isBest && <span className="best-ribbon">🏆 Best Route</span>}

      {/* Top row */}
      <div className="rc-top">
        <div className="rc-name-area">
          <h3 className="rc-name">{route.route_name}</h3>
          <div className="rc-badges">
            {isActive && <span className="badge-active">Viewing</span>}
          </div>
        </div>
        <ScoreRing score={safety?.score ?? 0} color={color} />
      </div>

      {/* Stats */}
      <div className="rc-stats">
        <div className="rc-stat">
          <span className="rc-stat-val">{route.distance}</span>
          <span className="rc-stat-lbl">Distance</span>
        </div>
        <div className="rc-stat-divider" />
        <div className="rc-stat">
          <span className="rc-stat-val">{route.duration}</span>
          <span className="rc-stat-lbl">Duration</span>
        </div>
        <div className="rc-stat-divider" />
        <div className="rc-stat">
          <span className="rc-stat-val" style={{ color }}>
            {safety?.level ?? 'N/A'}
          </span>
          <span className="rc-stat-lbl">Risk</span>
        </div>
      </div>

      {/* Risk bar */}
      <div className="rc-bar-wrap">
        <div
          className="rc-bar"
          style={{
            width: `${safety?.score ?? 0}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
          }}
        />
      </div>

      {/* Warnings */}
      {route.warnings?.length > 0 && (
        <div className="rc-warnings">
          {route.warnings.map((w, i) => (
            <span key={i} className="rc-warning">{w}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default RouteCard;
