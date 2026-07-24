import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Check } from 'lucide-react';
import { Input } from '../../../components/ui';

interface LocationPickerProps {
  value: string;
  onChange: (mapsLink: string) => void;
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateError('Your browser does not support location access.');
      return;
    }
    setLocating(true);
    setLocateError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onChange(`https://www.google.com/maps?q=${latitude},${longitude}`);
        setLocating(false);
        setShowPasteBox(false);
      },
      () => {
        setLocateError('Could not access your location. Check location permissions.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePickOnMaps = () => {
    window.open('https://www.google.com/maps', '_blank', 'noopener,noreferrer');
    setShowPasteBox(true);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Location on Map</label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 border-slate-200 dark:border-dark-500 text-slate-700 dark:text-slate-300 font-bold text-sm hover:border-primary-300 disabled:opacity-60 transition-all"
        >
          <Navigation size={16} />
          {locating ? 'Locating...' : 'Use Current Location'}
        </button>
        <button
          type="button"
          onClick={handlePickOnMaps}
          className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 border-slate-200 dark:border-dark-500 text-slate-700 dark:text-slate-300 font-bold text-sm hover:border-primary-300 transition-all"
        >
          <MapPin size={16} />
          Pick on Google Maps
        </button>
      </div>

      {locateError && <p className="text-xs text-red-500 font-medium pl-1">{locateError}</p>}

      {showPasteBox && !value && (
        <Input
          placeholder="Paste the link you copied from Google Maps"
          value={value}
          onChange={e => onChange(e.target.value)}
          autoFocus
        />
      )}

      {value && (
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
          <span className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <Check size={14} /> Location set
          </span>
          <div className="flex items-center gap-3">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400"
            >
              Open in Maps <ExternalLink size={12} />
            </a>
            <button
              type="button"
              onClick={() => { onChange(''); setShowPasteBox(false); }}
              className="text-xs font-bold text-slate-500 dark:text-slate-400"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
