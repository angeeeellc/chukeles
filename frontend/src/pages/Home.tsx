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
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  lugarSeleccionado?.id === lugar.id 
                    ? 'bg-green-50 border-forest-green shadow-sm ring-1 ring-forest-green' 
                    : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                    {lugar.fotoUrl ? (
                      <img src={lugar.fotoUrl} alt={lugar.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-800">{lugar.nombre}</h3>
                    <p className="text-[10px] text-ocean-blue font-semibold uppercase">{traducirCategoria(lugar.categoria)}</p>
                    <p className="text-[10px] text-gray-500 line-clamp-1">📍 {lugar.direccion}</p>
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
