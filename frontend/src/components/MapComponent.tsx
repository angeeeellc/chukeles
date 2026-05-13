import { useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useLugarStore } from '../store/lugarStore';
import type { Lugar } from '../services/lugarService';
import { useNavigate } from 'react-router-dom';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 43.3623,
  lng: -8.4115
};

interface MapComponentProps {
  lugares: Lugar[];
}

const MapComponent = ({ lugares }: MapComponentProps) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const { lugarSeleccionado, setLugarSeleccionado } = useLugarStore();
  const navigate = useNavigate();

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  useEffect(() => {
    if (mapRef.current && lugarSeleccionado) {
      mapRef.current.panTo({ lat: lugarSeleccionado.lat, lng: lugarSeleccionado.lng });
      mapRef.current.setZoom(16);
    }
  }, [lugarSeleccionado]);

  const traducirCategoria = (cat: string) => {
    const map: Record<string, string> = {
      'VET': 'VETERINARIO', 'PARK': 'PARQUE', 'GROOMING': 'PELUQUERIA',
      'STORE': 'TIENDA', 'HOTEL': 'HOTEL', 'TRAINING': 'ADIESTRAMIENTO', 'OTHER': 'OTRO'
    };
    return map[cat.toUpperCase()] || cat;
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100">
        <p className="text-gray-500 font-medium">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {lugares.map((lugar) => (
          <MarkerF
            key={lugar.id}
            position={{ lat: lugar.lat, lng: lugar.lng }}
            onClick={() => setLugarSeleccionado(lugar)}
          >
            {lugarSeleccionado?.id === lugar.id && (
              <InfoWindowF
                position={{ lat: lugar.lat, lng: lugar.lng }}
                onCloseClick={() => setLugarSeleccionado(null)}
              >
                <div style={{ padding: '4px', maxWidth: '180px' }}>
                  <h4 style={{ fontWeight: 'bold', color: '#15803d', margin: 0, fontSize: '13px' }}>{lugar.nombre}</h4>
                  <p style={{ fontSize: '10px', color: '#6b7280', margin: '4px 0' }}>{traducirCategoria(lugar.categoria)}</p>
                  {lugar.fotoUrl && (
                    <img 
                      src={lugar.fotoUrl} 
                      alt={lugar.nombre} 
                      style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800';
                        (e.target as HTMLImageElement).onerror = null;
                      }}
                    />
                  )}
                  <p style={{ fontSize: '11px', color: '#4b5563', lineHeight: 1.4, marginBottom: '8px' }}>
                    {lugar.descripcion && lugar.descripcion.length > 60 
                      ? lugar.descripcion.substring(0, 60) + '...' 
                      : lugar.descripcion}
                  </p>
                  <button 
                    onClick={() => navigate(`/place/${lugar.id}`)}
                    style={{
                      width: '100%', padding: '6px', background: '#15803d', color: 'white', border: 'none', 
                      borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'block'
                    }}
                  >
                    Ver detalle
                  </button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${lugar.lat},${lugar.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block', textAlign: 'center', width: '100%', padding: '6px', background: '#f3f4f6', 
                      color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '11px', 
                      fontWeight: 'bold', cursor: 'pointer', marginTop: '4px', textDecoration: 'none', boxSizing: 'border-box'
                    }}
                  >
                    ¿Cómo llegar?
                  </a>
                </div>
              </InfoWindowF>
            )}
          </MarkerF>
        ))}
      </GoogleMap>
    </div>
  );
};

export default MapComponent;
