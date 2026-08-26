export type FacilityType = 'hospital' | 'pharmacy' | 'lab' | 'clinic';

export interface OverpassFacility {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  distanceKm?: number;
  phone?: string;
  tags?: Record<string, string>;
  costLevel?: 'Low' | 'Medium' | 'High';
  estimatedCost?: number;
}

/**
 * Calculates distance in km between two lat/lng coordinates using the Haversine formula.
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return parseFloat((R * c).toFixed(2));
}

/**
 * Fetches nearby facilities from the Overpass API based on user coordinates and a search radius.
 * @param lat Latitude
 * @param lng Longitude
 * @param type 'hospital' or 'pharmacy'
 * @param radius Radius in meters (default 10000m = 10km)
 */
export async function fetchNearbyFacilities(
  lat: number,
  lng: number,
  type: FacilityType,
  radius: number = 5000 // default to 5000 as per directive
): Promise<OverpassFacility[]> {
  // Use our backend proxy to avoid CORS issues with direct Overpass calls
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const proxyUrl = `${API_BASE}/api/proxy/overpass`;
  
  // Construct Overpass QL query
  let query = '';
  if (type === 'hospital') {
    query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lng});
        way["amenity"="hospital"](around:${radius},${lat},${lng});
        relation["amenity"="hospital"](around:${radius},${lat},${lng});
        node["amenity"="clinic"](around:${radius},${lat},${lng});
      );
      out center;
    `;
  } else if (type === 'pharmacy') {
    query = `
      [out:json][timeout:25];
      (
        node["amenity"="pharmacy"](around:${radius},${lat},${lng});
        way["amenity"="pharmacy"](around:${radius},${lat},${lng});
        relation["amenity"="pharmacy"](around:${radius},${lat},${lng});
      );
      out center;
    `;
  } else if (type === 'lab') {
    query = `
      [out:json][timeout:25];
      (
        node["healthcare"="laboratory"](around:${radius},${lat},${lng});
        way["healthcare"="laboratory"](around:${radius},${lat},${lng});
        relation["healthcare"="laboratory"](around:${radius},${lat},${lng});
        node["amenity"="clinic"](around:${radius},${lat},${lng});
      );
      out center;
    `;
  } else if (type === 'clinic') {
    query = `
      [out:json][timeout:25];
      (
        node["amenity"="clinic"](around:${radius},${lat},${lng});
        way["amenity"="clinic"](around:${radius},${lat},${lng});
        relation["amenity"="clinic"](around:${radius},${lat},${lng});
        node["amenity"="doctors"](around:${radius},${lat},${lng});
      );
      out center;
    `;
  }

  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // If no facilities found and radius is 5000, expand to 15000 and retry
    if ((!data.elements || data.elements.length === 0) && radius === 5000) {
      console.log(`No ${type} found within 5km. Expanding radius to 15km...`);
      return fetchNearbyFacilities(lat, lng, type, 15000);
    }
    
    // Parse results
    const facilities: OverpassFacility[] = data.elements
      .map((element: any) => {
        // Handle ways/relations which return a center lat/lon
        const elLat = element.lat || element.center?.lat;
        const elLng = element.lon || element.center?.lon;
        
        if (!elLat || !elLng) return null;

        const distanceKm = calculateDistance(lat, lng, elLat, elLng);
        
        // Generate a deterministic pseudo-random cost based on the ID so it doesn't change on re-render
        const costSeed = parseInt(element.id.toString().slice(-4)) || Math.floor(Math.random() * 1000);
        let costLevel: 'Low' | 'Medium' | 'High' = 'Medium';
        let estimatedCost = 500;
        
        if (costSeed % 3 === 0) {
          costLevel = 'High';
          estimatedCost = 1500 + (costSeed % 10) * 100;
        } else if (costSeed % 3 === 1) {
          costLevel = 'Low';
          estimatedCost = 200 + (costSeed % 10) * 30;
        } else {
          costLevel = 'Medium';
          estimatedCost = 500 + (costSeed % 10) * 50;
        }

        return {
          id: element.id.toString(),
          name: element.tags?.name || 'Unknown Facility',
          lat: elLat,
          lng: elLng,
          address: element.tags?.['addr:full'] || element.tags?.['addr:street'] || 'Address unavailable',
          phone: element.tags?.phone || element.tags?.['contact:phone'] || '',
          distanceKm,
          tags: element.tags,
          costLevel,
          estimatedCost
        };
      })
      .filter(Boolean)
      // Sort by closest distance
      .sort((a: OverpassFacility, b: OverpassFacility) => (a.distanceKm || 0) - (b.distanceKm || 0));
      
    return facilities;
  } catch (error) {
    console.error('Error fetching facilities from Overpass:', error);
    return [];
  }
}

/**
 * Uses the Nominatim API to get coordinates for a manually entered city name.
 */
export async function fetchCityCoordinates(city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
    if (!response.ok) throw new Error('Nominatim API error');
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (err) {
    console.error('Error fetching city coordinates:', err);
    return null;
  }
}
