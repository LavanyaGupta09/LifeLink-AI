export type FacilityType = 'hospital' | 'pharmacy' | 'lab';

export interface OverpassFacility {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  distanceKm?: number;
  phone?: string;
  tags?: Record<string, string>;
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
  radius: number = 10000
): Promise<OverpassFacility[]> {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  
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
  }

  try {
    const response = await fetch(overpassUrl, {
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
    
    // Parse results
    const facilities: OverpassFacility[] = data.elements
      .map((element: any) => {
        // Handle ways/relations which return a center lat/lon
        const elLat = element.lat || element.center?.lat;
        const elLng = element.lon || element.center?.lon;
        
        if (!elLat || !elLng) return null;

        const distanceKm = calculateDistance(lat, lng, elLat, elLng);
        
        return {
          id: element.id.toString(),
          name: element.tags?.name || 'Unknown Facility',
          lat: elLat,
          lng: elLng,
          address: element.tags?.['addr:full'] || element.tags?.['addr:street'] || 'Address unavailable',
          phone: element.tags?.phone || element.tags?.['contact:phone'] || '',
          distanceKm,
          tags: element.tags,
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
