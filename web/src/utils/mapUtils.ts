import { useState, useEffect } from 'react';

// OSRM Routing API (Free, no key)
export async function fetchRoute(startLng: number, startLat: number, endLng: number, endLat: number) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('OSRM fetch failed');
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      // OSRM returns GeoJSON coordinates as [lng, lat], but Leaflet Polyline expects [lat, lng]
      const coordinates: [number, number][] = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      return {
        durationSeconds: route.duration,
        distanceMeters: route.distance,
        coordinates,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching route from OSRM:", error);
    return null;
  }
}

// Nominatim Geocoding API (Free, no key, strictly rate-limited)
export async function searchAddress(query: string) {
  if (!query) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en'
      }
    });
    if (!response.ok) throw new Error('Nominatim fetch failed');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching from Nominatim:", error);
    return [];
  }
}

// Custom hook to strictly debounce values (e.g. search inputs) by 1.5 seconds
export function useDebounce<T>(value: T, delay: number = 1500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
