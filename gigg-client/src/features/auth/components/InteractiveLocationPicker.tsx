import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation, Search, Check, Loader2, Map as MapIcon } from 'lucide-react';
import { Input } from '../../../components/ui';

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface InteractiveLocationPickerProps {
  city: string;
  area: string;
  onChange: (data: { city: string; area: string; lat?: number; lng?: number }) => void;
}

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function MapEvents({ onLocationClick }: { onLocationClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export function InteractiveLocationPicker({ city, area, onChange }: InteractiveLocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');

  const [mapCenter, setMapCenter] = useState<[number, number]>([13.0827, 80.2707]); // Default Chennai
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);

  const debounceTimer = useRef<any>();

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setPredictions([]);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchPredictions(searchQuery);
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  const fetchPredictions = async (input: string) => {
    setLoadingSearch(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/maps/autocomplete?input=${encodeURIComponent(input)}`);
      const data = await res.json();
      if (data.predictions) {
        setPredictions(data.predictions);
        setShowPredictions(true);
      }
    } catch (err) {
      console.error('Failed to fetch predictions', err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSelectPrediction = async (placeId: string, description: string) => {
    setShowPredictions(false);
    setSearchQuery(description);

    try {
      // Get lat/lng for the place
      const res = await fetch(`${BACKEND_URL}/api/maps/place?placeId=${placeId}`);
      const data = await res.json();
      if (data.lat && data.lng) {
        setMapCenter([data.lat, data.lng]);
        setMarkerPos([data.lat, data.lng]);

        // Now reverse geocode to extract City and Area consistently
        await fetchAndSetLocationData(data.lat, data.lng);
      }
    } catch (err) {
      console.error('Failed to fetch place details', err);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateError('Your browser does not support location access.');
      return;
    }
    setLocating(true);
    setLocateError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCenter([latitude, longitude]);
        setMarkerPos([latitude, longitude]);
        await fetchAndSetLocationData(latitude, longitude);
        setLocating(false);
      },
      () => {
        setLocateError('Could not access your location. Check permissions.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMapClick = async (lat: number, lng: number) => {
    setMarkerPos([lat, lng]);
    await fetchAndSetLocationData(lat, lng);
  };

  const fetchAndSetLocationData = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/maps/reverse-geocode?lat=${lat}&lng=${lng}`);
      const data = await res.json();

      if (data.city || data.area) {
        setSearchQuery(data.formattedAddress || '');
        onChange({
          city: data.city || city,
          area: data.area || area,
          lat,
          lng
        });
      }
    } catch (err) {
      console.error('Failed to reverse geocode', err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search Input */}
      <div className="relative z-20">
        <Input
          label="Search Address"
          placeholder="Start typing your area, building or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (predictions.length > 0) setShowPredictions(true);
          }}
          leftIcon={<Search size={16} />}
          rightIcon={loadingSearch ? <Loader2 size={16} className="animate-spin text-slate-400" /> : undefined}
        />

        {/* Dropdown */}
        {showPredictions && predictions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-600 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
            {predictions.map(p => (
              <button
                key={p.placeId}
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-dark-700 border-b border-slate-100 dark:border-dark-700 last:border-0"
                onClick={() => handleSelectPrediction(p.placeId, p.description)}
              >
                <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{p.mainText}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{p.secondaryText}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-primary-200 bg-primary-50 dark:border-primary-900/30 dark:bg-primary-900/10 text-primary-700 dark:text-primary-400 font-bold text-sm hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-colors disabled:opacity-60"
        >
          {locating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
          {locating ? 'Locating...' : 'Use Current Location'}
        </button>
      </div>

      {locateError && <p className="text-xs text-red-500 font-medium">{locateError}</p>}

      {/* Selected Location Summary */}
      <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-dark-800/50 p-3 rounded-xl border border-slate-200 dark:border-dark-600">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">City</label>
          <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate" title={city || 'Not selected'}>
            {city || 'Not selected'}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Area</label>
          <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate" title={area || 'Not selected'}>
            {area || 'Not selected'}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border-2 border-slate-200 dark:border-dark-600 relative h-[200px] z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {markerPos && <Marker position={markerPos} />}
          <MapEvents onLocationClick={handleMapClick} />
          <MapRecenter lat={mapCenter[0]} lng={mapCenter[1]} />
        </MapContainer>
        <div className="absolute bottom-2 left-2 right-2 bg-white/90 dark:bg-dark-900/90 backdrop-blur text-xs px-3 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-dark-600 shadow-sm pointer-events-none text-center">
          Tap on the map to pin a location
        </div>
      </div>

    </div>
  );
}
