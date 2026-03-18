import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// Automatically fit map to route bounds
function BoundsFitter({ routes, activeRoute }) {
  const map = useMap();
  useEffect(() => {
    const target = activeRoute || routes?.[0];
    if (target?.coordinates?.length > 1) {
      try {
        const bounds = L.latLngBounds(target.coordinates);
        map.fitBounds(bounds, { padding: [60, 60] });
      } catch (_) {}
    }
  }, [activeRoute, routes, map]);
  return null;
}

function MapView({ routes, activeRoute, source, destination }) {
  const defaultCenter = [28.6139, 77.2090];

  const startCoord = activeRoute?.coordinates?.[0];
  const endCoord = activeRoute?.coordinates?.[activeRoute.coordinates.length - 1];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      scrollWheelZoom
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <BoundsFitter routes={routes} activeRoute={activeRoute} />

      {/* Draw all routes as faint background lines */}
      {routes.map((route) => {
        const isActive = activeRoute?.route_id === route.route_id;
        if (isActive) return null; // draw active route separately
        return (
          <Polyline
            key={route.route_id}
            positions={route.coordinates || []}
            pathOptions={{
              color: route.safety?.color || '#94a3b8',
              weight: 3,
              opacity: 0.3,
              dashArray: '6 6',
            }}
          />
        );
      })}

      {/* Draw active route on top */}
      {activeRoute?.coordinates?.length > 1 && (
        <>
          {/* Glow shadow */}
          <Polyline
            positions={activeRoute.coordinates}
            pathOptions={{
              color: activeRoute.safety?.color || '#3b82f6',
              weight: 14,
              opacity: 0.15,
            }}
          />
          {/* Main line */}
          <Polyline
            positions={activeRoute.coordinates}
            pathOptions={{
              color: activeRoute.safety?.color || '#3b82f6',
              weight: 6,
              opacity: 0.9,
            }}
          >
            <Popup>
              <strong>{activeRoute.route_name}</strong><br />
              📏 {activeRoute.distance} &nbsp; ⏱ {activeRoute.duration}<br />
              🛡️ Safety: {activeRoute.safety?.score}/100 — {activeRoute.safety?.level} Risk
            </Popup>
          </Polyline>

          {/* Start marker */}
          {startCoord && (
            <Marker position={startCoord} icon={startIcon}>
              <Popup>🟢 Start: {source || 'Source'}</Popup>
            </Marker>
          )}

          {/* End marker */}
          {endCoord && (
            <Marker position={endCoord} icon={endIcon}>
              <Popup>🔴 End: {destination || 'Destination'}</Popup>
            </Marker>
          )}
        </>
      )}

      {/* Empty state overlay hint */}
      {routes.length === 0 && (
        <div className="map-hint">
          Enter source &amp; destination to see safe routes
        </div>
      )}
    </MapContainer>
  );
}

export default MapView;
