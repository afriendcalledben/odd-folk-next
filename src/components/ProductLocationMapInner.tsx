'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';

// Fix Leaflet default marker icon broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface Props {
  lat: number;
  lng: number;
}

export default function ProductLocationMapInner({ lat, lng }: Props) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      scrollWheelZoom={false}
      zoomControl={false}
      style={{ height: '200px', width: '100%' }}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Circle
        center={[lat, lng]}
        radius={800}
        pathOptions={{
          color: '#ff6b2b',
          fillColor: '#ff6b2b',
          fillOpacity: 0.15,
          weight: 2,
        }}
      />
    </MapContainer>
  );
}
