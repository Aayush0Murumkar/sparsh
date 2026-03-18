import React, { useState } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Footer from './components/Footer';
import RouteForm from './components/RouteForm';
import RouteCard from './components/RouteCard';
import MapView from './components/MapView';
import './App.css';

// ─── Change this to your deployed backend URL for production ──────────────────
const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

function App() {
  const [source, setSource]           = useState('');
  const [destination, setDestination] = useState('');
  const [time, setTime]               = useState('day');
  const [routes, setRoutes]           = useState([]);
  const [bestRouteId, setBestRouteId] = useState(null);
  const [activeRouteId, setActiveRouteId] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  /* ── Normalise route data coming from the backend ─────────────────────────
     Supports both response shapes:
       { safety_score, risk_level }               ← original backend
       { safety: { score, level, color } }         ← enhanced backend
  ───────────────────────────────────────────────────────────────────────── */
  const normalise = (r, idx) => {
    const score = r.safety?.score ?? r.safety_score ?? 70;
    const level = r.safety?.level ?? r.risk_level ?? 'Medium';
    const color =
      r.safety?.color ??
      (level === 'Low' ? '#34c759' : level === 'Medium' ? '#ffcc00' : '#ff3b30');

    return {
      ...r,
      route_id:   r.route_id ?? idx + 1,
      route_name: r.route_name ?? `Route Option ${idx + 1}`,
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
  };

  const handleSubmit = async ({ source: src, destination: dest, time: t }) => {
    setSource(src);
    setDestination(dest);
    setTime(t);
    setLoading(true);
    setError('');
    setRoutes([]);
    setHasSearched(true);

    try {
      const { data } = await axios.post(`${API_BASE}/api/get-safe-routes`, {
        source: src,
        destination: dest,
        time: t,
      });

      if (!data?.routes?.length) {
        setError('No routes found. Try different locations.');
        return;
      }

      const norm = data.routes.map(normalise);
      // highest safety score = best route
      const best =
        data.best_route_id ??
        norm.reduce((a, b) => (b.safety.score > a.safety.score ? b : a)).route_id;

      setRoutes(norm);
      setBestRouteId(best);
      setActiveRouteId(best);
    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to the backend. Make sure it is running on port 8000.');
      } else {
        setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const activeRoute = routes.find((r) => r.route_id === activeRouteId);

  return (
    <div className="app-shell">
      <Header />

      <main className="main-content">
        {/* ── Hero band ── */}
        <section className="hero-band">
          <span className="hero-pill">AI-Powered Safety</span>
          <h2 className="hero-title">
            Find your <em>safest</em> path home
          </h2>
          <p className="hero-sub">
            Real-time route analysis with safety scoring for day &amp; night travel.
          </p>
        </section>

        {/* ── Form + Results ── */}
        <section className="content-section">
          <RouteForm onSubmit={handleSubmit} loading={loading} />

          {error && (
            <div className="error-card" role="alert">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="loading-wrap">
              <div className="apple-spinner" />
              <p className="loading-text">Analysing routes for safety…</p>
            </div>
          )}

          {routes.length > 0 && (
            <div className="results-grid">
              {/* Left: route cards */}
              <div className="cards-col">
                <h3 className="section-label">
                  {routes.length} Route{routes.length > 1 ? 's' : ''} Found
                </h3>
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

              {/* Right: map */}
              <div className="map-col">
                <MapView
                  routes={routes}
                  activeRoute={activeRoute}
                  source={source}
                  destination={destination}
                />
              </div>
            </div>
          )}

          {!loading && hasSearched && routes.length === 0 && !error && (
            <p className="empty-hint">No routes available for this query.</p>
          )}
        </section>

        {/* ── Features strip ── */}
        {!hasSearched && (
          <section className="features-strip">
            {[
              { icon: '🛡️', title: 'Safety Scoring', desc: 'AI analyses each route for safety based on time of day.' },
              { icon: '🗺️', title: 'Live Map View', desc: 'Colour-coded polylines show the safest path at a glance.' },
              { icon: '🌙', title: 'Day & Night', desc: 'Different scoring for daytime and night-time travel.' },
            ].map((f) => (
              <div key={f.title} className="feature-tile">
                <span className="feature-icon">{f.icon}</span>
                <h4 className="feature-title">{f.title}</h4>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
