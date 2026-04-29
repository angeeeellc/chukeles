import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import type { Place } from '../services/placeService';
import { usePlaceStore } from '../store/placeStore';

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

// Helper component to center map when selectedPlace changes
const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

interface MapComponentProps {
  places: Place[];
}

const MapComponent = ({ places }: MapComponentProps) => {
  const { selectedPlace, setSelectedPlace } = usePlaceStore();

  const defaultCenter: [number, number] = [43.3623, -8.4115];
  const defaultZoom = 14;

  const currentCenter: [number, number] = selectedPlace 
    ? [selectedPlace.lat, selectedPlace.lng] 
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
        
        <ChangeView center={currentCenter} zoom={selectedPlace ? 16 : defaultZoom} />

        {places.map((place) => (
          <Marker 
            key={place.id} 
            position={[place.lat, place.lng]}
            eventHandlers={{
              click: () => {
                setSelectedPlace(place);
              },
            }}
          >
            <Popup>
              <div className="p-1 max-w-[150px]">
                <h4 className="font-bold text-forest-green m-0 text-sm">{place.name}</h4>
                <p className="text-[10px] text-gray-500 my-1">{place.category}</p>
                {place.photoUrl && (
                  <img src={place.photoUrl} alt={place.name} className="w-full h-16 object-cover rounded mb-1" />
                )}
                <p className="text-[9px] text-gray-600 line-clamp-2 leading-tight">{place.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
