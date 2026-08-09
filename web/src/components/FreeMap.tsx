import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet marker icon issue in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  popup?: React.ReactNode;
}

export interface FreeMapProps {
  center: [number, number];
  zoom: number;
  markers?: MapMarker[];
  routeCoordinates?: [number, number][]; // Array of [lat, lng] for Polyline
  className?: string;
}

// Helper to auto-center map when center prop changes
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const FreeMap: React.FC<FreeMapProps> = ({ center, zoom, markers, routeCoordinates, className }) => {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <ChangeView center={center} zoom={zoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers?.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]}>
            {(marker.label || marker.popup) && (
              <Popup>
                {marker.popup ? marker.popup : <strong>{marker.label}</strong>}
              </Popup>
            )}
          </Marker>
        ))}

        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline positions={routeCoordinates} color="#f59e0b" weight={5} opacity={0.8} />
        )}
      </MapContainer>
    </div>
  );
};

export default FreeMap;
