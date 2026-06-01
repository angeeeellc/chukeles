import { useEffect, useState, useRef, useMemo } from 'react'
import { useLugarStore } from '../estado/estadoLugar'
import type { Lugar } from '../servicios/servicioLugar'
import ComponenteMapa from '../componentes/ComponenteMapa'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faLocationDot, faXmark, faHospital, faTree, faScissors, faStore, faBuilding, faGraduationCap, faMugHot, faPaw } from '@fortawesome/free-solid-svg-icons'
import { useDebounce } from '../ganchos/useDebounce'
import { useNavigate } from 'react-router-dom'

// ── Categorías disponibles ────────────────────────────────────────────────────
const CATEGORIAS = [
  { valor: 'VETERINARIO', etiqueta: 'Veterinarios',    icon: faHospital },
  { valor: 'PARQUE',      etiqueta: 'Parques',         icon: faTree },
  { valor: 'PELUQUERIA',  etiqueta: 'Peluquerías',     icon: faScissors },
  { valor: 'TIENDA',      etiqueta: 'Tiendas',         icon: faStore },
  { valor: 'HOTEL',       etiqueta: 'Hoteles',         icon: faBuilding },
  { valor: 'ADIESTRAMIENTO', etiqueta: 'Adiest.',      icon: faGraduationCap },
  { valor: 'PET_FRIENDLY', etiqueta: 'Pet Friendly',   icon: faMugHot },
]

// ── Skeleton de tarjeta ───────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
    <div className="w-full h-36 bg-gray-200" />
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-full mb-1" />
      <div className="h-3 bg-gray-200 rounded w-5/6 mb-4" />
      <div className="flex justify-between pt-3 border-t border-gray-100">
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/5" />
      </div>
    </div>
  </div>
)

const traducirCategoria = (cat: string) => {
  const map: Record<string, string> = {
    VET: 'Veterinario', PARK: 'Parque', GROOMING: 'Peluquería',
    STORE: 'Tienda', HOTEL: 'Hotel', TRAINING: 'Adiestramiento',
    OTHER: 'Otro', PET_FRIENDLY: 'Pet Friendly',
    VETERINARIO: 'Veterinario', PARQUE: 'Parque', PELUQUERIA: 'Peluquería',
    TIENDA: 'Tienda', ADIESTRAMIENTO: 'Adiestramiento',
  }
  return map[cat?.toUpperCase()] || cat
}

// ── Componente principal ──────────────────────────────────────────────────────
const Inicio = () => {
  const navigate = useNavigate()
  const {
    lugares, cargando, filtros,
    cargarLugares, setFiltros, resetFiltros,
    lugarSeleccionado, setLugarSeleccionado,
  } = useLugarStore()

  // Estado local del buscador (debounced)
  const [busquedaLocal, setBusquedaLocal] = useState(filtros.nombre || '')
  const busquedaDebounced = useDebounce(busquedaLocal, 300)

  // Categorías seleccionadas (multi-select)
  const [categoriasActivas, setCategoriasActivas] = useState<string[]>([])
  
  // Menú móvil (lista vs mapa)
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)


  const listRef = useRef<HTMLDivElement>(null)

  // Carga inicial
  useEffect(() => { cargarLugares() }, [])

  // Debounce del nombre → update del store
  useEffect(() => {
    if (busquedaDebounced !== (filtros.nombre || '')) {
      setFiltros({ nombre: busquedaDebounced || undefined })
    }
  }, [busquedaDebounced])

  // Cuando cambian las categorías activas (multi → el backend solo acepta 1 a la vez,
  // así que enviamos la primera seleccionada; si hay 0 → sin filtro de categoría)
  useEffect(() => {
    setFiltros({
      categoria: categoriasActivas.length === 1 ? categoriasActivas[0] : undefined,
    })
  }, [categoriasActivas])



  // Scroll hacia la tarjeta seleccionada
  useEffect(() => {
    if (lugarSeleccionado && listRef.current) {
      const el = listRef.current.querySelector(`[data-id="${lugarSeleccionado.id}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [lugarSeleccionado])

  // Toggle de categoría
  const toggleCategoria = (valor: string) => {
    setCategoriasActivas((prev) =>
      prev.includes(valor) ? prev.filter((c) => c !== valor) : [...prev, valor]
    )
  }



  const limpiarTodo = () => {
    setBusquedaLocal('')
    setCategoriasActivas([])
    resetFiltros()
  }

  const lugaresMostrar = useMemo(() => {
    if (categoriasActivas.length === 0) return lugares;
    return lugares.filter((l: Lugar) => categoriasActivas.includes(l.categoria.toUpperCase() || l.categoria));
  }, [lugares, categoriasActivas]);

  const hayFiltrosActivos = busquedaLocal || categoriasActivas.length > 0

  return (
    <div className="flex flex-col flex-1 w-full h-full overflow-hidden bg-gray-50">

      {/* ── Barra superior ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">

          {/* Buscador */}
          <div className="relative flex-1">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              id="home-search-input"
              type="text"
              value={busquedaLocal}
              onChange={(e) => setBusquedaLocal(e.target.value)}
              placeholder="Buscar veterinarios, parques, peluquerías..."
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50
                         focus:outline-none focus:ring-2 focus:ring-forest-green/50 focus:border-forest-green
                         transition-all placeholder-gray-400"
            />
            {busquedaLocal && (
              <button
                onClick={() => setBusquedaLocal('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Limpiar búsqueda"
              >
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Chips de categoría (horizontal scroll) */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIAS.map(({ valor, etiqueta, icon: Icon }) => {
            const activa = categoriasActivas.includes(valor)
            return (
              <button
                key={valor}
                id={`chip-${valor.toLowerCase()}`}
                onClick={() => toggleCategoria(valor)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                            whitespace-nowrap border transition-all shrink-0 ${
                  activa
                    ? 'bg-forest-green text-white border-forest-green shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-forest-green hover:text-forest-green'
                }`}
              >
                <span><FontAwesomeIcon icon={Icon} className="w-3.5 h-3.5" /></span>
                {etiqueta}
              </button>
            )
          })}
        </div>


      </div>

      {/* ── Contenido principal ───────────────────────────────────────────── */}
      <div className="flex flex-row flex-1 w-full overflow-hidden">

        {/* Sidebar izquierdo */}
        <div
          ref={listRef}
          className={`
            absolute md:relative z-30 bg-gray-50 border-r border-gray-200 shrink-0 flex flex-col transition-transform duration-300
            w-full h-full md:w-[380px] md:min-w-[300px]
            ${menuMovilAbierto ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
          `}
        >
          {/* Contador + limpiar */}
          <div className="px-4 pt-3 pb-2 flex items-center justify-between shrink-0">
            <p className="text-xs text-gray-500 font-medium">
              {cargando ? 'Buscando...' : (
                `${lugaresMostrar.length} ${lugaresMostrar.length === 1 ? 'lugar' : 'lugares'}`
              )}
            </p>
            {hayFiltrosActivos && (
              <button
                id="home-clear-filters"
                onClick={limpiarTodo}
                className="flex items-center gap-1 text-xs text-forest-green font-semibold hover:underline"
              >
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Skeletons */}
          {cargando && (
            <div className="p-4 flex flex-col gap-4">
              {[1, 2, 3, 4].map((n) => <CardSkeleton key={n} />)}
            </div>
          )}

          {/* Empty state */}
          {!cargando && lugaresMostrar.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 p-8 text-center">
              <FontAwesomeIcon icon={faPaw} className="w-16 h-16 text-forest-green mb-2" />
              <p className="text-sm font-bold text-gray-700">Sin resultados</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                No encontramos lugares con estos filtros
              </p>
              <button
                onClick={limpiarTodo}
                className="mt-2 bg-forest-green text-white text-xs font-bold px-5 py-2.5 rounded-full
                           hover:bg-green-700 transition-all"
              >
                Mostrar todos los lugares
              </button>
            </div>
          )}

          {/* Lista de tarjetas */}
          {!cargando && lugaresMostrar.length > 0 && (
            <div className="p-4 flex flex-col gap-4 pb-8">
              {lugaresMostrar.map((lugar: Lugar) => (
                <div
                  key={lugar.id}
                  data-id={lugar.id}
                  onClick={() => setLugarSeleccionado(lugar)}
                  className={`bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ease-out border ${
                    lugarSeleccionado?.id === lugar.id
                      ? 'border-forest-green ring-2 ring-forest-green/20 shadow-md scale-[1.02]'
                      : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                  }`}
                >
                  {lugar.fotoUrl && (
                    <div className="w-full h-40 overflow-hidden relative bg-gray-200">
                      <img
                        src={lugar.fotoUrl}
                        alt={lugar.nombre}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800'
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
                        <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                        <span className="truncate">{lugar.direccion}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/place/${lugar.id}`) }}
                        className="text-[10px] font-bold text-forest-green uppercase tracking-wider hover:text-green-800 transition-colors"
                      >
                        Ver más
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mapa */}
        <div className="flex-1 h-full relative overflow-hidden bg-gray-100">
          <ComponenteMapa lugares={lugaresMostrar} />
          
          {/* Botón flotante para móvil */}
          <button
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
            className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-forest-green text-white px-6 py-3 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.2)] font-bold flex items-center gap-2 active:scale-95 transition-all border-2 border-white/20"
          >
            <FontAwesomeIcon icon={menuMovilAbierto ? faXmark : faLocationDot} /> 
            {menuMovilAbierto ? 'Cerrar Lista' : 'Ver Lista de Lugares'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Inicio
