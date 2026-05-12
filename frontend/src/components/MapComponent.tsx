import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import type { Lugar } from '../services/lugarService';
import { useLugarStore } from '../store/lugarStore';

// Fix para los iconos de los marcadores en React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Componente interno que fuerza invalidateSize y centra el mapa
const MapController = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();

  useEffect(() => {
    // Forzar recálculo del tamaño del contenedor (crítico en Docker/Nginx)
    setTimeout(() => {
      map.invalidateSize();
      map.setView(center, zoom);
    }, 100);
  }, [center, zoom, map]);

  return null;
};

interface MapComponentProps {
  lugares: Lugar[];
}

const MapComponent = ({ lugares }: MapComponentProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const traducirCategoria = (cat: string) => {
    const map: Record<string, string> = {
      'VET': 'VETERINARIO',
      'PARK': 'PARQUE',
      'GROOMING': 'PELUQUERIA',
      'STORE': 'TIENDA',
      'HOTEL': 'HOTEL',
      'TRAINING': 'ADIESTRAMIENTO',
      'OTHER': 'OTRO'
    };
    return map[cat.toUpperCase()] || cat;
  };

  const { lugarSeleccionado, setLugarSeleccionado } = useLugarStore();

  const defaultCenter: [number, number] = [43.3623, -8.4115];
  const defaultZoom = 14;

  const currentCenter: [number, number] = lugarSeleccionado
    ? [lugarSeleccionado.lat, lugarSeleccionado.lng]
    : defaultCenter;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        minHeight: '400px',
      }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={currentCenter} zoom={lugarSeleccionado ? 16 : defaultZoom} />

        {lugares.map((lugar) => (
          <Marker
            key={lugar.id}
            position={[lugar.lat, lugar.lng]}
            eventHandlers={{
              click: () => {
                setLugarSeleccionado(lugar);
              },
            }}
          >
            <Popup>
              <div style={{ padding: '4px', maxWidth: '150px' }}>
                <h4 style={{ fontWeight: 'bold', color: '#2d6a4f', margin: 0, fontSize: '13px' }}>{lugar.nombre}</h4>
                <p style={{ fontSize: '10px', color: '#6b7280', margin: '4px 0' }}>{traducirCategoria(lugar.categoria)}</p>
                {lugar.fotoUrl && (
                  <img src={lugar.fotoUrl} alt={lugar.nombre} style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '4px', marginBottom: '4px' }} />
                )}
                <p style={{ fontSize: '9px', color: '#4b5563', lineHeight: 1.4 }}>{lugar.descripcion}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
