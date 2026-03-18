import React, { useState } from 'react';
import './RouteForm.css';

function RouteForm({ onSubmit, loading }) {
  const [source, setSource]           = useState('');
  const [destination, setDestination] = useState('');
  const [time, setTime]               = useState('day');
  const [touched, setTouched]         = useState({});

  const validate = () => source.trim() && destination.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ source: true, destination: true });
    if (!validate()) return;
    onSubmit({ source: source.trim(), destination: destination.trim(), time });
  };

  return (
    <div className="route-form-wrap" id="home">
      <form className="route-form" onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          {/* Source */}
          <div className={`form-field ${touched.source && !source.trim() ? 'form-field--error' : ''}`}>
            <label className="form-label" htmlFor="source">
              <span className="label-icon">📍</span> From
            </label>
            <input
              id="source"
              className="form-input"
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, source: true }))}
              placeholder="e.g. Connaught Place, Delhi"
              autoComplete="off"
            />
            {touched.source && !source.trim() && (
              <span className="field-error">Please enter a source location.</span>
            )}
          </div>

          {/* Destination */}
          <div className={`form-field ${touched.destination && !destination.trim() ? 'form-field--error' : ''}`}>
            <label className="form-label" htmlFor="destination">
              <span className="label-icon">🏁</span> To
            </label>
            <input
              id="destination"
              className="form-input"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, destination: true }))}
              placeholder="e.g. India Gate, Delhi"
              autoComplete="off"
            />
            {touched.destination && !destination.trim() && (
              <span className="field-error">Please enter a destination.</span>
            )}
          </div>

          {/* Time */}
          <div className="form-field form-field--time">
            <label className="form-label">
              <span className="label-icon">🕐</span> Travel Time
            </label>
            <div className="time-seg">
              <button
                type="button"
                className={`seg-btn ${time === 'day' ? 'seg-btn--active' : ''}`}
                onClick={() => setTime('day')}
              >
                ☀️ Day
              </button>
              <button
                type="button"
                className={`seg-btn ${time === 'night' ? 'seg-btn--active' : ''}`}
                onClick={() => setTime('night')}
              >
                🌙 Night
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="form-field form-field--submit">
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <><span className="btn-spinner" /> Calculating…</>
              ) : (
                'Get Safe Routes →'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default RouteForm;
