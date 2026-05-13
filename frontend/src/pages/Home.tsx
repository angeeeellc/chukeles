import { useEffect, useState, useMemo } from 'react'
import { useLugarStore } from '../store/lugarStore'
import type { Lugar } from '../services/lugarService'
import MapComponent from '../components/MapComponent'
import { Search, MapPin, ChevronDown } from 'lucide-react'

const CATEGORIAS = [
  { valor: 'TODOS',       etiqueta: 'Todos',          emoji: '🐾' },
  { valor: 'PARQUE',      etiqueta: 'Parques',         emoji: '🌳' },
  { valor: 'VETERINARIO', etiqueta: 'Veterinarios',    emoji: '🏥' },
  { valor: 'PELUQUERIA',  etiqueta: 'Peluquerías',     emoji: '✂️' },
  { valor: 'TIENDA',      etiqueta: 'Tiendas',         emoji: '🛍️' },
  { valor: 'HOTEL',       etiqueta: 'Hoteles',         emoji: '🏨' },
  { valor: 'ADIESTRAMIENTO', etiqueta: 'Adiestramiento', emoji: '🎓' },
  { valor: 'PET_FRIENDLY', etiqueta: 'Pet Friendly',  emoji: '☕' },
]

const Home = () => {
  // Using local state for the filter to keep it simple, or we could add to lugarStore
  // The current lugarStore in this session doesn't have it, so we'll use a local state.
  const [categoriaActiva, setCategoriaActiva] = useState('TODOS')

  const traducirCategoria = (cat: string) => {
    const map: Record<string, string> = {
      'VET': 'VETERINARIO', 'PARK': 'PARQUE', 'GROOMING': 'PELUQUERIA',
      'STORE': 'TIENDA', 'HOTEL': 'HOTEL', 'TRAINING': 'ADIESTRAMIENTO', 'OTHER': 'OTRO'
    }
    return map[cat.toUpperCase()] || cat
  }

  const { lugares, cargando, error, cargarLugares, lugarSeleccionado, setLugarSeleccionado } = useLugarStore()

  useEffect(() => { cargarLugares() }, [cargarLugares])

  const lugaresFiltrados = useMemo(() => {
    return lugares.filter((lugar: Lugar) => {
      return categoriaActiva === 'TODOS' || lugar.categoria.toUpperCase() === categoriaActiva
    })
  }, [lugares, categoriaActiva])

  return (
    <div className="flex flex-col flex-1 w-full h-full overflow-hidden bg-gray-50">
      {/* Header superior */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shrink-0 shadow-sm z-10">
        <div>
          <h2 className="text-lg font-bold text-gray-900 m-0">Explorar A Coruña</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {lugaresFiltrados.length} {lugaresFiltrados.length === 1 ? 'lugar' : 'lugares'} para tu mascota
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-row flex-1 w-full overflow-hidden">
        {/* Sidebar izquierdo */}
        <div className="w-[380px] min-w-[320px] h-full overflow-y-auto overflow-x-hidden bg-gray-50 border-r border-gray-200 shrink-0 flex flex-col">
          
          {/* Desplegable de categoría */}
          <div className="p-4 pb-2 bg-gray-50 shrink-0 sticky top-0 z-10">
            <div className="relative">
              <select
                value={categoriaActiva}
                onChange={(e) => setCategoriaActiva(e.target.value)}
                className="w-full box-border py-2.5 pl-4 pr-10 border-1.5 border-gray-200 rounded-xl text-sm font-semibold text-gray-800 bg-white cursor-pointer outline-none appearance-none shadow-sm transition-colors focus:border-forest-green focus:ring-1 focus:ring-forest-green"
              >
                {CATEGORIAS.map(({ valor, etiqueta, emoji }) => (
                  <option key={valor} value={valor}>{emoji} {etiqueta}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Lista de resultados */}
          {cargando && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-8 h-8 border-4 border-forest-green/20 border-t-forest-green rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Buscando lugares...</p>
            </div>
          )}
          
          {error && (
            <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-xl text-center text-red-600 text-sm">
              {error}
            </div>
          )}

          {!cargando && lugaresFiltrados.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <Search className="w-8 h-8 text-gray-300" />
              <p className="text-sm text-gray-400 font-medium">Sin resultados para esa búsqueda</p>
            </div>
          )}

          <div className="p-4 flex flex-col gap-4">
            {lugaresFiltrados.map((lugar: Lugar) => (
              <div
                key={lugar.id}
                onClick={() => setLugarSeleccionado(lugar)}
                className={`bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ease-out border ${
                  lugarSeleccionado?.id === lugar.id 
                    ? 'border-forest-green ring-2 ring-forest-green/20 shadow-md scale-[1.02]' 
                    : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                }`}
              >
                {lugar.fotoUrl && (
                  <div className="w-full h-44 overflow-hidden relative bg-gray-200">
                    <img
                      src={lugar.fotoUrl} 
                      alt={lugar.nombre}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800'
                        ;(e.target as HTMLImageElement).onerror = null
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/95 backdrop-blur-sm text-forest-green text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                        {traducirCategoria(lugar.categoria)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-sm text-gray-900 mb-1 leading-snug">{lugar.nombre}</h3>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">
                    {lugar.descripcion}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex items-center text-[11px] text-gray-400 overflow-hidden w-2/3">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                      <span className="truncate">{lugar.direccion}</span>
                    </div>
                    <button className="text-[10px] font-bold text-forest-green uppercase tracking-wider hover:text-green-800 transition-colors">
                      Ver más
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mapa */}
        <div className="flex-1 h-full relative overflow-hidden bg-gray-100">
          <MapComponent lugares={lugaresFiltrados} />
        </div>
      </div>
    </div>
  )
}

export default Home
