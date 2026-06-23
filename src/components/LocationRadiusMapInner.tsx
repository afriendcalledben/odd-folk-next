'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMap } from 'react-leaflet';

// Fix Leaflet default marker icon broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

const MILES_TO_METERS = 1609.34;

// Re-centres and zooms the map so the radius circle always fits the viewport.
function FitToCircle({ lat, lng, radiusMeters }: { lat: number; lng: number; radiusMeters: number }) {
  const map = useMap();
  useEffect(() => {
    // toBounds takes the full edge-to-edge size, so pass diameter (radius * 2).
    const bounds = L.latLng(lat, lng).toBounds(radiusMeters * 2);
    map.fitBounds(bounds, { padding: [24, 24] });
  }, [lat, lng, radiusMeters, map]);
  return null;
}

interface Props {
  lat: number;
  lng: number;
  distanceMiles: number;
}

export default function LocationRadiusMapInner({ lat, lng, distanceMiles }: Props) {
  const radiusMeters = distanceMiles * MILES_TO_METERS;
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]} />
      <Circle
        center={[lat, lng]}
        radius={radiusMeters}
        pathOptions={{ color: '#F54F19', fillColor: '#F54F19', fillOpacity: 0.15, weight: 2 }}
      />
      <FitToCircle lat={lat} lng={lng} radiusMeters={radiusMeters} />
    </MapContainer>
  );
}
