import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const defaultCenter: [number, number] = [43.3623, -8.4115];

interface MapComponentAdminProps {
  lat: number | null;
  lng: number | null;
  onSelectCoordinates: (lat: number, lng: number) => void;
}

// Componente interno que maneja los clics y sincroniza la vista
const ClickHandler = ({
  onSelectCoordinates,
  setMarkerPos,
}: {
  onSelectCoordinates: (lat: number, lng: number) => void;
  setMarkerPos: (pos: [number, number]) => void;
}) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarkerPos([lat, lng]);
      onSelectCoordinates(lat, lng);
    },
  });
  return null;
};

// Mueve el mapa cuando cambian los props externos (ej: al cargar datos de edición)
const SyncView = ({ lat, lng }: { lat: number | null; lng: number | null }) => {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lng !== null) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }
  }, [lat, lng, map]);
  return null;
};

const ComponenteMapaAdmin = ({ lat, lng, onSelectCoordinates }: MapComponentAdminProps) => {
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(
    lat !== null && lng !== null ? [lat, lng] : null
  );

  // Sincronizar marcador si los props externos cambian (modo edición)
  useEffect(() => {
    if (lat !== null && lng !== null) {
      setMarkerPos([lat, lng]);
    }
  }, [lat, lng]);

  const center: [number, number] =
    lat !== null && lng !== null ? [lat, lng] : defaultCenter;

  return (
    <div className="relative w-full">
      <MapContainer
        center={center}
        zoom={14}
        style={{ width: '100%', height: '300px', borderRadius: '12px', border: '1px solid #e5e7eb' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <SyncView lat={lat} lng={lng} />

        <ClickHandler
          onSelectCoordinates={onSelectCoordinates}
          setMarkerPos={setMarkerPos}
        />

        {markerPos && (
          <Marker
            position={markerPos}
            draggable={true}
            eventHandlers={{
              dragend(e) {
                const { lat, lng } = e.target.getLatLng();
                setMarkerPos([lat, lng]);
                onSelectCoordinates(lat, lng);
              },
            }}
          />
        )}
      </MapContainer>
      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] text-gray-600 font-semibold border border-gray-200 shadow-sm pointer-events-none select-none z-[1000]">
        Pincha en el mapa o arrastra el pin
      </div>
    </div>
  );
};

export default ComponenteMapaAdmin;
