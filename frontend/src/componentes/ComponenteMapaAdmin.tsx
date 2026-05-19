import { useCallback, useRef, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '12px',
  border: '1px solid #e5e7eb'
};

const defaultCenter = {
  lat: 43.3623,
  lng: -8.4115
};

interface MapComponentAdminProps {
  lat: number | null;
  lng: number | null;
  onSelectCoordinates: (lat: number, lng: number) => void;
}

const ComponenteMapaAdmin = ({ lat, lng, onSelectCoordinates }: MapComponentAdminProps) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script-admin',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [markerPos, setMarkerPos] = useState<google.maps.LatLngLiteral | null>(null);

  // Sincronizar el marcador cuando cambian los props externos (ej: al cargar datos para editar)
  useEffect(() => {
    if (lat !== null && lng !== null) {
      setMarkerPos({ lat, lng });
      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
      }
    }
  }, [lat, lng]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (lat !== null && lng !== null) {
      map.panTo({ lat, lng });
    }
  }, [lat, lng]);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const clickedLat = e.latLng.lat();
      const clickedLng = e.latLng.lng();
      setMarkerPos({ lat: clickedLat, lng: clickedLng });
      onSelectCoordinates(clickedLat, clickedLng);
    }
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const draggedLat = e.latLng.lat();
      const draggedLng = e.latLng.lng();
      setMarkerPos({ lat: draggedLat, lng: draggedLng });
      onSelectCoordinates(draggedLat, draggedLng);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[300px] w-full bg-gray-100 rounded-xl border border-gray-200">
        <p className="text-gray-500 font-medium text-sm animate-pulse">Cargando mapa interactivo...</p>
      </div>
    );
  }

  // Intercept and suppress the Google Maps Marker deprecation warning
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('google.maps.Marker is deprecated')) return;
    originalConsoleError.apply(console, args);
  };
  
  console.warn = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('google.maps.Marker is deprecated')) return;
    originalConsoleWarn.apply(console, args);
  };

  const center = markerPos || defaultCenter;

  return (
    <div className="relative w-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {markerPos && (
          <MarkerF
            position={markerPos}
            draggable={true}
            onDragEnd={handleMarkerDragEnd}
            animation={window.google?.maps?.Animation?.DROP}
          />
        )}
      </GoogleMap>
      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] text-gray-600 font-semibold border border-gray-200 shadow-sm pointer-events-none select-none z-10">
        Pincha en el mapa o arrastra el pin
      </div>
    </div>
  );
};

export default ComponenteMapaAdmin;
