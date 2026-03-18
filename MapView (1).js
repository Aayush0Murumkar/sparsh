import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

/* ── Fix Leaflet's broken default icons in Webpack ─────────────────────────── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const startIcon = new L.Icon({
  iconUrl:      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl:    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize:     [25, 41],
  iconAnchor:   [12, 41],
  popupAnchor:  [1, -34],
  shadowSize:   [41, 41],
});

const endIcon = new L.Icon({
  iconUrl:      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl:    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize:     [25, 41],
  iconAnchor:   [12, 41],
  popupAnchor:  [1, -34],
  shadowSize:   [41, 41],
});

/* Auto-fit map bounds to the active route */
function BoundsFitter({ routes, activeRoute }) {
  const map = useMap();
  useEffect(() => {
    const target = activeRoute || routes?.[0];
    if (target?.coordinates?.length > 1) {
      try {
        map.fitBounds(L.latLngBounds(target.coordinates), { padding: [50, 50] });
      } catch (_) {}
    }
  }, [activeRoute, routes, map]);
  return null;
}

function MapView({ routes, activeRoute, source, destination }) {
  const startCoord = activeRoute?.coordinates?.[0];
  const endCoord   = activeRoute?.coordinates?.[activeRoute.coordinates.length - 1];

  return (
    <div className="mapview-wrap">
      <MapContainer
        center={[28.6139, 77.209]}
        zoom={12}
        scrollWheelZoom
        className="mapview-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <BoundsFitter routes={routes} activeRoute={activeRoute} />

        {/* All non-active routes – faint dashed lines */}
        {routes.map((route) => {
          if (route.route_id === activeRoute?.route_id) return null;
          return (
            <Polyline
              key={route.route_id}
              positions={route.coordinates || []}
              pathOptions={{
                color:     route.safety?.color || '#aeaeb2',
                weight:    3,
                opacity:   0.3,
                dashArray: '6 8',
              }}
            />
          );
        })}

        {/* Active route – bold with glow */}
        {activeRoute?.coordinates?.length > 1 && (
          <>
            {/* Halo */}
            <Polyline
              positions={activeRoute.coordinates}
              pathOptions={{
                color:   activeRoute.safety?.color || '#007aff',
                weight:  14,
                opacity: 0.12,
              }}
            />
            {/* Main line */}
            <Polyline
              positions={activeRoute.coordinates}
              pathOptions={{
                color:   activeRoute.safety?.color || '#007aff',
                weight:  5,
                opacity: 1,
              }}
            >
              <Popup className="map-popup">
                <strong>{activeRoute.route_name}</strong><br />
                📏 {activeRoute.distance} &nbsp;|&nbsp; ⏱ {activeRoute.duration}<br />
                🛡️ Safety Score: <strong>{activeRoute.safety?.score}/100</strong>
                &nbsp;({activeRoute.safety?.level} Risk)
              </Popup>
            </Polyline>

            {/* Start marker */}
            {startCoord && (
              <Marker position={startCoord} icon={startIcon}>
                <Popup>🟢 <strong>Start</strong><br />{source || 'Source'}</Popup>
              </Marker>
            )}

            {/* End marker */}
            {endCoord && (
              <Marker position={endCoord} icon={endIcon}>
                <Popup>🔴 <strong>End</strong><br />{destination || 'Destination'}</Popup>
              </Marker>
            )}
          </>
        )}

        {/* Empty state overlay */}
        {routes.length === 0 && (
          <div className="map-empty">
            <div className="map-empty-card">
              <span className="map-empty-icon">🗺️</span>
              <p>Enter locations above to see safe routes on the map</p>
            </div>
          </div>
        )}
      </MapContainer>
    </div>
  );
}

export default MapView;
