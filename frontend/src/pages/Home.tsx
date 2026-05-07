import { useEffect } from 'react'
import { useLugarStore } from '../store/lugarStore'
import type { Lugar } from '../services/lugarService'
import MapComponent from '../components/MapComponent'

const Home = () => {
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

  const { lugares, cargando, error, cargarLugares, lugarSeleccionado, setLugarSeleccionado } = useLugarStore()

  useEffect(() => {
    cargarLugares()
  }, [cargarLugares])

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden">
      {/* Search Header / Title */}
      <div className="bg-white p-4 border-b flex justify-between items-center px-8 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Lugares en A Coruña</h2>
          <p className="text-sm text-gray-500">{lugares.length} sitios encontrados</p>
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
          {cargando && <div className="p-8 text-center text-gray-500">Cargando...</div>}
          {error && <div className="p-8 text-center text-red-500 text-sm">{error}</div>}
          
          <div className="p-4 space-y-4">
            {lugares.map((lugar: Lugar) => (
              <div 
                key={lugar.id} 
                onClick={() => setLugarSeleccionado(lugar)}
                className={`flex flex-col rounded-xl border cursor-pointer transition-all overflow-hidden hover:shadow-lg hover:border-forest-green/30 hover:bg-gray-50/50 ${
                  lugarSeleccionado?.id === lugar.id 
                    ? 'bg-green-50 border-forest-green shadow-md ring-1 ring-forest-green scale-[1.02]' 
                    : 'bg-white border-gray-100 shadow-sm'
                }`}
              >
                {lugar.fotoUrl && (
                  <div className="w-full h-32 overflow-hidden">
                    <img src={lugar.fotoUrl} alt={lugar.nombre} className="w-full h-full object-cover transition-transform hover:scale-110" />
                  </div>
                )}
                <div className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm text-gray-800 leading-tight flex-1">{lugar.nombre}</h3>
                    <span className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full ml-2 shrink-0">
                      {traducirCategoria(lugar.categoria)}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">
                    {lugar.descripcion}
                  </p>
                  <div className="flex items-center text-[10px] text-gray-400">
                    <span className="mr-1">📍</span>
                    <span className="truncate">{lugar.direccion}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map View */}
        <div className="flex-1 h-1/2 md:h-full bg-gray-200">
          <MapComponent lugares={lugares} />
        </div>
      </div>
    </div>
  )
}

export default Home
