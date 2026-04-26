'use client';

import dynamic from 'next/dynamic';

interface Props {
  city: string;
  lat: number;
  lng: number;
}

const MapInner = dynamic(() => import('./ProductLocationMapInner'), { ssr: false });

export default function ProductLocationMap({ city, lat, lng }: Props) {
  return (
    <div className="bg-white border border-brand-grey/50 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <svg className="w-4 h-4 text-brand-orange flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="font-body text-sm font-medium text-brand-burgundy">Near {city}</span>
      </div>
      <MapInner lat={lat} lng={lng} />
      <p className="px-4 py-2 text-xs text-brand-burgundy/40 font-body">Exact location shared after booking is confirmed</p>
    </div>
  );
}
