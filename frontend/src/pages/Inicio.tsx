import { useEffect, useState, useRef, useMemo } from 'react'
import { useLugarStore } from '../store/storeLugar'
import type { Lugar } from '../services/servicioLugar'
import ComponenteMapa from '../components/ComponenteMapa'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faLocationDot, faXmark, faHospital, faTree, faScissors, faStore, faBuilding, faGraduationCap, faMugHot, faPaw, faBars, faMap } from '@fortawesome/free-solid-svg-icons'
import { useDebounce } from '../hooks/useDebounce'
import { useNavigate, Link } from 'react-router-dom'
import { useUserStore } from '../store/storeUsuario'
import FormularioSugerirLugar from '../components/FormularioSugerirLugar'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
const CATEGORIAS = [
  { valor: 'VETERINARIO', etiqueta: 'Veterinarios',    icon: faHospital },
  { valor: 'PARQUE',      etiqueta: 'Parques',         icon: faTree },
  { valor: 'PELUQUERIA',  etiqueta: 'Peluquerías',     icon: faScissors },
  { valor: 'TIENDA',      etiqueta: 'Tiendas',         icon: faStore },
  { valor: 'HOTEL',       etiqueta: 'Hoteles',         icon: faBuilding },
  { valor: 'ADIESTRAMIENTO', etiqueta: 'Adiest.',      icon: faGraduationCap },
  { valor: 'PET_FRIENDLY', etiqueta: 'Pet Friendly',   icon: faMugHot },
]
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
const Inicio = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useUserStore()
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
  // Estado para expandir mapa en móvil
  const [mapaExpandidoMovil, setMapaExpandidoMovil] = useState(false)
  const [modalSugerirAbierto, setModalSugerirAbierto] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)

  // Carga inicial
  useEffect(() => { cargarLugares() }, [])

  // Debounce del nombre → update del store
  useEffect(() => {
    if (busquedaDebounced !== (filtros.nombre || '')) {
      setFiltros({ nombre: busquedaDebounced || undefined })
    }
  }, [busquedaDebounced])

  // Cuando cambian las categorías activas
  useEffect(() => {
    setFiltros({
      categoria: categoriasActivas.length === 1 ? categoriasActivas[0] : undefined,
    })
  }, [categoriasActivas])

  // Al seleccionar un lugar: hace scroll a la tarjeta en la lista
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
    setLugarSeleccionado(null)
  }

  const lugaresMostrar = useMemo(() => {
    if (categoriasActivas.length === 0) return lugares;
    return lugares.filter((l: Lugar) => categoriasActivas.includes(l.categoria.toUpperCase() || l.categoria));
  }, [lugares, categoriasActivas]);

  const hayFiltrosActivos = busquedaLocal || categoriasActivas.length > 0

  return (
    <div className="flex flex-col flex-1 w-full h-full overflow-hidden bg-gray-50">

      {/* ── Barra superior ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 shrink-0 shadow-sm relative z-[100]">
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Buscador */}
          <div className="relative flex-1 min-w-0">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" />
            <input
              id="home-search-input"
              type="text"
              value={busquedaLocal}
              onChange={(e) => setBusquedaLocal(e.target.value)}
              placeholder="Buscar veterinarios, parques..."
              className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50
                         focus:outline-none focus:ring-2 focus:ring-forest-green/50 focus:border-forest-green
                         transition-all placeholder-gray-400"
            />
            {busquedaLocal && (
              <button
                onClick={() => setBusquedaLocal('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label="Limpiar búsqueda"
              >
                <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              if (!isAuthenticated) { navigate('/iniciar-sesion'); return; }
              setModalSugerirAbierto(true);
            }}
            className="shrink-0 flex items-center gap-1.5 sm:gap-2 bg-forest-green text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-green-700 active:scale-95 transition-all shadow-sm"
          >
            <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Sugerir Lugar</span>
            <span className="sm:hidden text-xs">Sugerir</span>
          </button>
        </div>

        {/* Chips de categoría (horizontal scroll) */}
        <div className="flex gap-2 mt-2 sm:mt-3 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
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

      {/* ── Contenido principal: responsivo columna en móvil, fila en desktop ────── */}
      <div className="flex flex-col md:flex-row flex-1 w-full overflow-hidden relative">

        {/* Mapa (En móvil se muestra arriba ajustado; en desktop va a la derecha) */}
        <div className={`
          w-full relative overflow-hidden bg-gray-100 transition-all duration-300
          ${mapaExpandidoMovil ? 'h-full flex-1' : 'h-[36vh] min-h-[220px] max-h-[340px] md:h-full md:flex-1 md:max-h-none'}
          order-1 md:order-2 border-b md:border-b-0 border-gray-200
        `}>
          <ComponenteMapa lugares={lugaresMostrar} />

          {/* Botón flotante para alternar pantalla completa de mapa en móvil */}
          <button
            onClick={() => setMapaExpandidoMovil(!mapaExpandidoMovil)}
            className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-[600] bg-forest-green text-white px-6 py-2.5 rounded-full shadow-xl font-bold text-sm flex items-center gap-2 active:scale-95 transition-all border-2 border-white/20"
          >
            <FontAwesomeIcon icon={mapaExpandidoMovil ? faBars : faMap} />
            {mapaExpandidoMovil ? 'Ver Lista de Lugares' : 'Ver Mapa Completo'}
          </button>

          {/* Footer flotante en Mapa (desktop) */}
          <div className="hidden md:flex absolute bottom-6 right-6 z-[50] bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full text-xs text-forest-green/90 shadow-sm border border-white/50 items-center gap-3 w-max transition-all hover:bg-white/90">
            <Link to="/" className="font-bold flex items-center gap-1.5 hover:opacity-80 transition-opacity"><FontAwesomeIcon icon={faPaw} className="w-4 h-4" /> <span className="text-sm tracking-tight">Chukeles</span></Link>
            <span className="w-px h-4 bg-forest-green/20"></span>
            <Link to="/quienes-somos" className="hover:text-green-700 font-bold transition-colors">Quiénes Somos</Link>
          </div>
        </div>

        {/* Lista de lugares (En móvil se muestra abajo con scroll; en desktop a la izquierda) */}
        <div
          ref={listRef}
          className={`
            w-full md:w-[380px] md:min-w-[300px] bg-gray-50 border-r border-gray-200 shrink-0 flex flex-col
            overflow-y-auto overflow-x-hidden order-2 md:order-1
            ${mapaExpandidoMovil ? 'hidden md:flex' : 'flex-1 md:h-full'}
          `}
        >
          {/* Contador + controles */}
          <div className="px-4 pt-3 pb-2 flex items-center justify-between shrink-0 bg-white md:bg-gray-50 border-b border-gray-100 md:border-b-0">
            <p className="text-xs text-gray-500 font-medium">
              {cargando ? 'Buscando...' : (
                `${lugaresMostrar.length} ${lugaresMostrar.length === 1 ? 'lugar encontrado' : 'lugares encontrados'}`
              )}
            </p>
            <div className="flex items-center gap-3">
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
            <div className="p-3 sm:p-4 flex flex-col gap-3.5 sm:gap-4 pb-8">
              {lugaresMostrar.map((lugar: Lugar) => (
                <div
                  key={lugar.id}
                  data-id={lugar.id}
                  onClick={() => setLugarSeleccionado(lugar)}
                  className={`bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ease-out border ${
                    lugarSeleccionado?.id === lugar.id
                      ? 'border-forest-green ring-2 ring-forest-green/20 shadow-md scale-[1.01]'
                      : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                  }`}
                >
                  {lugar.fotoUrl && (
                    <div className="w-full h-36 sm:h-40 overflow-hidden relative bg-gray-200">
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
                  <div className="p-3.5 sm:p-4">
                    <h3 className="font-bold text-sm text-gray-900 mb-1 leading-snug">{lugar.nombre}</h3>
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">
                      {lugar.descripcion}
                    </p>
                    <div className="flex items-center justify-between pt-2.5 border-t border-gray-50">
                      <div className="flex items-center text-[11px] text-gray-400 overflow-hidden w-2/3">
                        <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 mr-1.5 shrink-0 text-forest-green" />
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
      </div>

      {modalSugerirAbierto && (
        <FormularioSugerirLugar
          onClose={() => setModalSugerirAbierto(false)}
          onSave={() => setModalSugerirAbierto(false)}
        />
      )}
    </div>
  )
}

export default Inicio
