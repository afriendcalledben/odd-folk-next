'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { Input, Button } from '@/components/ui';

// Fix Leaflet default marker icon broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

const AREA_TYPES = new Set([
  'postcode',
  'city', 'town', 'village', 'hamlet',
  'suburb', 'neighbourhood', 'quarter',
  'county', 'state_district', 'administrative',
  'municipality',
]);

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
  address: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
  };
}

export interface LocationData {
  name: string;
  address: string;
  postcode: string;
  city: string;
  lat: number;
  lng: number;
  type: string;
}

export interface InitialLocationData extends LocationData {
  id: string;
}

interface LocationPickerProps {
  onSave: (loc: LocationData) => Promise<void>;
  initialData?: InitialLocationData;
  onCancel?: () => void;
}

function DraggableMarker({
  position,
  onDragEnd,
}: {
  position: [number, number];
  onDragEnd: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  return (
    <Marker
      draggable
      position={position}
      ref={markerRef}
      eventHandlers={{
        dragend() {
          const marker = markerRef.current;
          if (marker) {
            const latlng = marker.getLatLng();
            onDragEnd(latlng.lat, latlng.lng);
          }
        },
      }}
    />
  );
}

export default function LocationPicker({ onSave, initialData, onCancel }: LocationPickerProps) {
  const isEditing = !!initialData;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(initialData?.name ?? '');
  const [address, setAddress] = useState(initialData?.address ?? '');
  const [postcode, setPostcode] = useState(initialData?.postcode ?? '');
  const [city, setCity] = useState(initialData?.city ?? '');
  const [lat, setLat] = useState<number | null>(initialData?.lat ?? null);
  const [lng, setLng] = useState<number | null>(initialData?.lng ?? null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasPin = lat !== null && lng !== null;
  const canSave = name.trim() && address.trim() && postcode.trim() && city.trim();

  // Debounced Nominatim search
  useEffect(() => {
    if (manualMode || query.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=8&countrycodes=gb`,
          { headers: { 'User-Agent': 'OddFolk/1.0 (contact@oddfolk.co.uk)', 'Accept-Language': 'en' } }
        );
        const data: NominatimResult[] = await res.json();
        const filtered = data.slice(0, 5);
        setResults(filtered);
        setShowDropdown(filtered.length > 0);
      } catch {
        // silently fail
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, manualMode]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function selectResult(result: NominatimResult) {
    const a = result.address;
    const streetNumber = [a.house_number, a.road].filter(Boolean).join(' ');
    const resolvedCity = a.city || a.town || a.village || a.suburb || '';
    setAddress(streetNumber || result.display_name.split(',')[0]);
    setPostcode(a.postcode || '');
    setCity(resolvedCity);
    setLat(parseFloat(result.lat));
    setLng(parseFloat(result.lon));
    setQuery(result.display_name);
    setShowDropdown(false);
  }

  const reverseGeocode = useCallback(async (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${newLat}&lon=${newLng}&format=json&addressdetails=1`,
        { headers: { 'User-Agent': 'OddFolk/1.0 (contact@oddfolk.co.uk)', 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data?.address) {
        const a = data.address;
        const streetNumber = [a.house_number, a.road].filter(Boolean).join(' ');
        const resolvedCity = a.city || a.town || a.village || a.suburb || '';
        if (streetNumber) setAddress(streetNumber);
        if (a.postcode) setPostcode(a.postcode);
        if (resolvedCity) setCity(resolvedCity);
      }
    } catch {
      // silently fail
    }
  }, []);

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        address: address.trim(),
        postcode: postcode.trim(),
        city: city.trim(),
        lat: lat ?? 51.5074,
        lng: lng ?? -0.1278,
        type: 'OTHER',
      });
      if (!isEditing) {
        setQuery('');
        setName('');
        setAddress('');
        setPostcode('');
        setCity('');
        setLat(null);
        setLng(null);
        setManualMode(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border border-brand-grey rounded-3xl p-8 shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-xl text-brand-blue">
          {isEditing ? 'Edit Collection Point' : 'Add a Collection Point'}
        </h3>
        <button
          type="button"
          onClick={() => { setManualMode(!manualMode); setResults([]); setShowDropdown(false); }}
          className="text-sm text-brand-orange underline font-body"
        >
          {manualMode ? 'Search address' : 'Enter manually'}
        </button>
      </div>

      {/* Name always at the top */}
      <Input
        label="Name / Label"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="e.g. Home, Studio, Warehouse"
      />

      {/* Address search or manual fields */}
      {!manualMode && (
        <div className="relative" ref={dropdownRef}>
          <Input
            label="Search address"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Start typing an address…"
          />
          {showDropdown && (
            <ul className="absolute z-50 w-full bg-white border border-brand-grey rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">
              {results.map(r => (
                <li
                  key={r.place_id}
                  className="px-4 py-3 hover:bg-brand-orange/10 cursor-pointer font-body text-brand-burgundy text-sm border-b border-brand-grey/30 last:border-0"
                  onMouseDown={() => selectResult(r)}
                >
                  {r.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Address detail fields — always shown when editing, in manual mode, or after search selection */}
      {(isEditing || manualMode || hasPin) && (
        <div className="space-y-4">
          <Input
            label="Address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="e.g. 12 Example Street"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Postcode"
              value={postcode}
              onChange={e => setPostcode(e.target.value)}
              placeholder="e.g. E1 6RF"
            />
            <Input
              label="City"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="e.g. London"
            />
          </div>
        </div>
      )}

      {/* Map */}
      {hasPin && (
        <>
          <div className="rounded-2xl overflow-hidden border border-brand-grey" style={{ height: 280 }}>
            <MapContainer
              center={[lat!, lng!]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <DraggableMarker position={[lat!, lng!]} onDragEnd={reverseGeocode} />
            </MapContainer>
          </div>
          <p className="text-xs text-brand-blue/50 font-body">Drag the pin to fine-tune your location.</p>
        </>
      )}

      <div className="flex gap-3">
        {isEditing && onCancel && (
          <Button variant="outline" fullWidth onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
        <Button variant="primary" fullWidth onClick={handleSave} disabled={!canSave || saving}>
          {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Collection Point'}
        </Button>
      </div>
    </div>
  );
}
