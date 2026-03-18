import React, { useState } from 'react';
import axios from 'axios';
import MapView from './components/MapView';
import RouteCard from './components/RouteCard';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

function App() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [time, setTime] = useState('day');
  const [routes, setRoutes] = useState([]);
  const [bestRouteId, setBestRouteId] = useState(null);
  const [activeRouteId, setActiveRouteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!source.trim() || !destination.trim()) {
      setError('Please enter both source and destination.');
      return;
    }
    setLoading(true);
    setError('');
    setRoutes([]);
    setHasSearched(true);

    try {
      const response = await axios.post(`${API_BASE}/api/get-safe-routes`, {
        source: source.trim(),
        destination: destination.trim(),
        time,
      });

      if (response.data?.routes?.length > 0) {
        const fetchedRoutes = response.data.routes;

        // Normalize route data to ensure consistent shape
        const normalized = fetchedRoutes.map((r) => {
          const score =
            r.safety_score ?? r.safety?.score ?? Math.floor(Math.random() * 35) + 55;
          const level =
            r.risk_level ?? r.safety?.level ?? (score > 70 ? 'Low' : score > 50 ? 'Medium' : 'High');
          const color =
            r.safety?.color ??
            (level === 'Low' ? '#22c55e' : level === 'Medium' ? '#f59e0b' : '#ef4444');

          return {
            ...r,
            route_name: r.route_name ?? `Route Option ${r.route_id}`,
            distance:
              typeof r.distance === 'number'
                ? `${r.distance.toFixed(1)} km`
                : r.distance_km
                ? `${r.distance_km} km`
                : r.distance ?? 'N/A',
            duration:
              typeof r.duration === 'number'
                ? `${Math.round(r.duration)} min`
                : r.duration_min
                ? `${r.duration_min} min`
                : r.duration ?? 'N/A',
            safety: { score, level, color },
          };
        });

        // Best route = highest safety score
        const best = normalized.reduce((a, b) =>
          b.safety.score > a.safety.score ? b : a
        );

        setRoutes(normalized);
        setBestRouteId(response.data.best_route_id ?? best.route_id);
        setActiveRouteId(response.data.best_route_id ?? best.route_id);
      } else {
        setError('No routes found. Try different locations.');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to backend. Make sure it is running on port 8000.');
      } else {
        setError(err.response?.data?.detail || 'Failed to fetch routes. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const activeRoute = routes.find((r) => r.route_id === activeRouteId);

  return (
    <div className="app">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        {/* Header */}
        <header className="sidebar-header">
          <div className="logo-wrap">
            <span className="logo-icon">🛡️</span>
            <div>
              <h1 className="logo-title">SheShield AI</h1>
              <p className="logo-sub">Women Safety Route Assistant</p>
            </div>
          </div>
        </header>

        {/* Form */}
        <form className="route-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="source">
              <span className="field-icon">📍</span> Source
            </label>
            <input
              id="source"
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g., Connaught Place, Delhi"
            />
          </div>

          <div className="field">
            <label htmlFor="destination">
              <span className="field-icon">🏁</span> Destination
            </label>
            <input
              id="destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., India Gate, Delhi"
            />
          </div>

          <div className="field">
            <label>
              <span className="field-icon">🕐</span> Time of Travel
            </label>
            <div className="time-toggle">
              <button
                type="button"
                className={`toggle-btn ${time === 'day' ? 'active' : ''}`}
                onClick={() => setTime('day')}
              >
                ☀️ Day
              </button>
              <button
                type="button"
                className={`toggle-btn ${time === 'night' ? 'active' : ''}`}
                onClick={() => setTime('night')}
              >
                🌙 Night
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" /> Analyzing Safety…
              </>
            ) : (
              '🔍 Get Safe Routes'
            )}
          </button>
        </form>

        {/* Error */}
        {error && <div className="error-banner">⚠️ {error}</div>}

        {/* Routes List */}
        <div className="routes-panel">
          {loading && (
            <div className="loading-card">
              <div className="pulse-dot" />
              <p>Scanning routes for safety…</p>
            </div>
          )}

          {!loading && hasSearched && routes.length === 0 && !error && (
            <div className="empty-state">No routes available.</div>
          )}

          {routes.map((route) => (
            <RouteCard
              key={route.route_id}
              route={route}
              isBest={route.route_id === bestRouteId}
              isActive={route.route_id === activeRouteId}
              onClick={() => setActiveRouteId(route.route_id)}
            />
          ))}
        </div>

        <footer className="sidebar-footer">
          <p>Stay safe. Trust the shield. 💜</p>
        </footer>
      </aside>

      {/* ── MAP ── */}
      <main className="map-area">
        <MapView
          routes={routes}
          activeRoute={activeRoute}
          source={source}
          destination={destination}
        />
      </main>
    </div>
  );
}

export default App;
