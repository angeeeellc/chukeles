import { useEffect } from 'react'
import { usePlaceStore } from '../store/placeStore'
import MapComponent from '../components/MapComponent'

const Home = () => {
  const { places, loading, error, loadPlaces, selectedPlace, setSelectedPlace } = usePlaceStore()

  useEffect(() => {
    loadPlaces()
  }, [loadPlaces])

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden">
      {/* Search Header / Title */}
      <div className="bg-white p-4 border-b flex justify-between items-center px-8 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Lugares en A Coruña</h2>
          <p className="text-sm text-gray-500">{places.length} sitios encontrados</p>
        </div>
        <div className="flex gap-2">
          {/* Future search/filter chips can go here */}
          <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-600">Todo</span>
          <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-600">Bio</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* List View */}
        <div className="w-full md:w-1/3 lg:w-1/4 h-1/2 md:h-full overflow-y-auto bg-gray-50 border-r">
          {loading && <div className="p-8 text-center text-gray-500">Cargando...</div>}
          {error && <div className="p-8 text-center text-red-500 text-sm">{error}</div>}
          
          <div className="p-4 space-y-4">
            {places.map((place) => (
              <div 
                key={place.id} 
                onClick={() => setSelectedPlace(place)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedPlace?.id === place.id 
                    ? 'bg-green-50 border-forest-green shadow-sm ring-1 ring-forest-green' 
                    : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                    {place.photoUrl ? (
                      <img src={place.photoUrl} alt={place.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">🐶</div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-800">{place.name}</h3>
                    <p className="text-[10px] text-ocean-blue font-semibold uppercase">{place.category}</p>
                    <p className="text-[10px] text-gray-500 line-clamp-1">📍 {place.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map View */}
        <div className="flex-1 h-1/2 md:h-full bg-gray-200">
          <MapComponent places={places} />
        </div>
      </div>
    </div>
  )
}

export default Home
