import { useState, useEffect, useCallback } from 'react';
import { fetchCityCoordinates } from '../lib/overpass';

export type GeoStatus = 'loading' | 'success' | 'denied' | 'error';

export function useGeolocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<GeoStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const requestLocation = useCallback(() => {
    setStatus('loading');
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('success');
      },
      (err) => {
        console.warn('Geolocation error:', err);
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
        } else {
          setStatus('error');
          setErrorMessage('Unable to retrieve your location.');
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const searchCity = async (city: string) => {
    setStatus('loading');
    const coords = await fetchCityCoordinates(city);
    if (coords) {
      setLocation(coords);
      setStatus('success');
    } else {
      setStatus('denied');
      setErrorMessage('City not found. Please try again.');
    }
  };

  return { location, status, errorMessage, searchCity, requestLocation };
}
