import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLugarStore } from '../store/storeLugar';
import type { Lugar } from '../services/servicioLugar';
import { useNavigate } from 'react-router-dom';

// Fix default marker icons broken in React/Webpack builds
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Colores personalizados por categoría
const CATEGORY_COLORS: Record<string, string> = {
  VETERINARIO:    '#ef4444',
  PARQUE:         '#22c55e',
  PELUQUERIA:     '#a855f7',
  TIENDA:         '#f97316',
  HOTEL:          '#3b82f6',
  ADIESTRAMIENTO: '#eab308',
  PET_FRIENDLY:   '#06b6d4',
  OTRO:           '#6b7280',
};

const createColoredIcon = (categoria: string) => {
  const color = CATEGORY_COLORS[categoria?.toUpperCase()] || '#6b7280';
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
};

// Componente auxiliar para hacer pan cuando cambia el lugar seleccionado
const PanToSelected = ({ lugar }: { lugar: Lugar | null }) => {
  const map = useMap();
  useEffect(() => {
    if (lugar) {
      map.setView([lugar.lat, lugar.lng], 16, { animate: true });
    }
  }, [lugar, map]);
  return null;
};

interface MapComponentProps {
  lugares: Lugar[];
}

const ComponenteMapa = ({ lugares }: MapComponentProps) => {
  const { lugarSeleccionado, setLugarSeleccionado } = useLugarStore();
  const navigate = useNavigate();
  const markerRefs = useRef<Record<number, L.Marker>>({});

  // Abrir popup del marcador seleccionado automáticamente
  useEffect(() => {
    if (lugarSeleccionado) {
      const marker = markerRefs.current[lugarSeleccionado.id];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [lugarSeleccionado]);

  const traducirCategoria = (cat: string) => {
    const map: Record<string, string> = {
      VETERINARIO: 'Veterinario', PARQUE: 'Parque', PELUQUERIA: 'Peluquería',
      TIENDA: 'Tienda', HOTEL: 'Hotel', ADIESTRAMIENTO: 'Adiestramiento',
      PET_FRIENDLY: 'Pet Friendly', OTRO: 'Otro'
    };
    return map[cat?.toUpperCase()] || cat;
  };

  return (
    <MapContainer
      center={[43.3623, -8.4115]}
      zoom={14}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <PanToSelected lugar={lugarSeleccionado} />

      {lugares.map((lugar) => (
        <Marker
          key={lugar.id}
          position={[lugar.lat, lugar.lng]}
          icon={createColoredIcon(lugar.categoria)}
          ref={(ref) => {
            if (ref) markerRefs.current[lugar.id] = ref;
          }}
          eventHandlers={{
            click: () => setLugarSeleccionado(lugar),
            popupclose: () => setLugarSeleccionado(null),
          }}
        >
          <Popup minWidth={180} maxWidth={200}>
            <div style={{ padding: '4px' }}>
              <h4 style={{ fontWeight: 'bold', color: '#15803d', margin: '0 0 2px', fontSize: '13px' }}>
                {lugar.nombre}
              </h4>
              <p style={{ fontSize: '10px', color: '#6b7280', margin: '0 0 6px' }}>
                {traducirCategoria(lugar.categoria)}
              </p>
              {lugar.fotoUrl && (
                <img
                  src={lugar.fotoUrl}
                  alt={lugar.nombre}
                  style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px', marginBottom: '6px' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800';
                    (e.target as HTMLImageElement).onerror = null;
                  }}
                />
              )}
              {lugar.descripcion && (
                <p style={{ fontSize: '11px', color: '#4b5563', lineHeight: 1.4, marginBottom: '8px' }}>
                  {lugar.descripcion.length > 60 ? lugar.descripcion.substring(0, 60) + '...' : lugar.descripcion}
                </p>
              )}
              <button
                onClick={() => navigate(`/place/${lugar.id}`)}
                style={{
                  width: '100%', padding: '6px', background: '#15803d', color: 'white',
                  border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                  cursor: 'pointer', display: 'block', marginBottom: '4px'
                }}
              >
                Ver detalle
              </button>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${lugar.lat},${lugar.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', textAlign: 'center', width: '100%', padding: '6px',
                  background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db',
                  borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                  cursor: 'pointer', textDecoration: 'none', boxSizing: 'border-box'
                }}
              >
                ¿Cómo llegar?
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default ComponenteMapa;
