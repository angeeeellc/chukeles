import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import type { Lugar } from '../services/lugarService';
import { useLugarStore } from '../store/lugarStore';

// Fix for default marker icon issues in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to center map when lugarSeleccionado changes
const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

interface MapComponentProps {
  lugares: Lugar[];
}

const MapComponent = ({ lugares }: MapComponentProps) => {
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
    <div className="h-full w-full">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeView center={currentCenter} zoom={lugarSeleccionado ? 16 : defaultZoom} />

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
              <div className="p-1 max-w-[150px]">
                <h4 className="font-bold text-forest-green m-0 text-sm">{lugar.nombre}</h4>
                <p className="text-[10px] text-gray-500 my-1">{traducirCategoria(lugar.categoria)}</p>
                {lugar.fotoUrl && (
                  <img src={lugar.fotoUrl} alt={lugar.nombre} className="w-full h-16 object-cover rounded mb-1" />
                )}
                <p className="text-[9px] text-gray-600 line-clamp-2 leading-tight">{lugar.descripcion}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
