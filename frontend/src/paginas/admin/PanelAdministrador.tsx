import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, faEdit, faPlus, faMagnifyingGlass, faRightFromBracket, faLocationDot, 
  faFileLines, faShoppingBag, faCalendarAlt, faShieldHalved, faRotateRight,
  faHospital, faTree, faScissors, faStore, faBuilding, faGraduationCap, faLocationArrow, faCircleQuestion, faInfoCircle, faUsers
} from '@fortawesome/free-solid-svg-icons';
import { useUserStore } from '../../estado/estadoUsuario';
import { useUiStore } from '../../estado/estadoUi';

// Componentes internos
import IniciarSesionAdmin from './IniciarSesionAdmin';
import FormularioLugar from './FormularioLugar';

import { fetchPlaces, eliminarLugarApi, type Lugar } from '../../servicios/servicioLugar';
import { 
  fetchPublicacionesAdmin, eliminarPublicacionAdmin, type PublicacionTablon,
  fetchAnunciosAdmin, eliminarAnuncioAdmin, type AnuncioMercado,
  fetchEventosAdmin, eliminarEventoAdmin, type Evento,
  fetchUsuariosAdmin, cambiarRolUsuarioAdmin, type UsuarioAdmin
} from '../../servicios/servicioAdmin';

// ── VISTA PRINCIPAL DEL DASHBOARD ─────────────────────────────────────────────
const DashboardAdmin = () => {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const { addToast } = useUiStore();

  const [activeTab, setActiveTab] = useState<'lugares' | 'tablon' | 'mercado' | 'eventos' | 'usuarios'>('lugares');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);

  // Estados de datos
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [publicaciones, setPublicaciones] = useState<PublicacionTablon[]>([]);
  const [anuncios, setAnuncios] = useState<AnuncioMercado[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);

  // Estado del modal de Lugar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [lugarParaEditar, setLugarParaEditar] = useState<number | null>(null);

  // Cargar datos según la pestaña activa
  const cargarDatos = async () => {
    setCargando(true);
    try {
      if (activeTab === 'lugares') {
        const data = await fetchPlaces();
        setLugares(data);
      } else if (activeTab === 'tablon') {
        const data = await fetchPublicacionesAdmin();
        setPublicaciones(data);
      } else if (activeTab === 'mercado') {
        const data = await fetchAnunciosAdmin();
        setAnuncios(data);
      } else if (activeTab === 'eventos') {
        const data = await fetchEventosAdmin();
        setEventos(data);
      } else if (activeTab === 'usuarios') {
        const data = await fetchUsuariosAdmin();
        setUsuarios(data);
      }
    } catch (err) {
      addToast('Error al obtener los datos del servidor.', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    addToast('Sesión de administrador cerrada.', 'info');
    navigate('/admin/login');
  };

  // Acciones de eliminación
  const handleEliminarLugar = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el lugar "${nombre}"?`)) {
      try {
        await eliminarLugarApi(id);
        addToast('Lugar eliminado correctamente.', 'success');
        cargarDatos();
      } catch (err) {
        addToast('No se pudo eliminar el lugar.', 'error');
      }
    }
  };

  const handleEliminarPublicacion = async (id: number, titulo: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar la publicación "${titulo}"?`)) {
      try {
        await eliminarPublicacionAdmin(id);
        addToast('Publicación eliminada correctamente.', 'success');
        cargarDatos();
      } catch (err) {
        addToast('No se pudo eliminar la publicación.', 'error');
      }
    }
  };

  const handleEliminarAnuncio = async (id: number, titulo: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar el producto "${titulo}"?`)) {
      try {
        await eliminarAnuncioAdmin(id);
        addToast('Anuncio eliminado correctamente.', 'success');
        cargarDatos();
      } catch (err) {
        addToast('No se pudo eliminar el anuncio.', 'error');
      }
    }
  };

  const handleEliminarEvento = async (id: number, titulo: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar la quedada "${titulo}"?`)) {
      try {
        await eliminarEventoAdmin(id);
        addToast('Quedada eliminada correctamente.', 'success');
        cargarDatos();
      } catch (err) {
        addToast('No se pudo eliminar la quedada.', 'error');
      }
    }
  };

  const handleHacerAdmin = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres dar permisos de administrador a este usuario?')) {
      try {
        await cambiarRolUsuarioAdmin(id, 'ROL_ADMIN');
        addToast('Permisos de administrador concedidos.', 'success');
        cargarDatos();
      } catch (err) {
        addToast('No se pudo cambiar el rol.', 'error');
      }
    }
  };

  // Filtrado de búsquedas en memoria
  const filtrarLugares = lugares.filter(l => 
    l.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    l.direccion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const filtrarPublicaciones = publicaciones.filter(p => 
    p.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
    p.contenido.toLowerCase().includes(busqueda.toLowerCase())
  );

  const filtrarAnuncios = anuncios.filter(a => 
    a.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
    a.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const filtrarEventos = eventos.filter(e => 
    e.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
    e.ubicacion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const filtrarUsuarios = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const traducirCategoria = (cat: string) => {
    const map: Record<string, React.ReactNode> = {
      'VET': <><FontAwesomeIcon icon={faHospital} className="w-3.5 h-3.5 inline mr-1" /> Veterinario</>,
      'PARK': <><FontAwesomeIcon icon={faTree} className="w-3.5 h-3.5 inline mr-1" /> Parque</>,
      'GROOMING': <><FontAwesomeIcon icon={faScissors} className="w-3.5 h-3.5 inline mr-1" /> Peluquería</>,
      'STORE': <><FontAwesomeIcon icon={faStore} className="w-3.5 h-3.5 inline mr-1" /> Tienda</>,
      'HOTEL': <><FontAwesomeIcon icon={faBuilding} className="w-3.5 h-3.5 inline mr-1" /> Hotel</>,
      'TRAINING': <><FontAwesomeIcon icon={faGraduationCap} className="w-3.5 h-3.5 inline mr-1" /> Adiestramiento</>,
      'OTHER': <><FontAwesomeIcon icon={faLocationArrow} className="w-3.5 h-3.5 inline mr-1" /> Otro</>
    };
    return map[cat.toUpperCase()] || cat;
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 overflow-hidden">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-forest-green text-white p-2 rounded-xl">
            <FontAwesomeIcon icon={faShieldHalved} className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">Consola de Control</h1>
            <p className="text-xs text-gray-500 font-semibold mt-1">Admin: {user?.name || 'Administrador'}</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700
                     px-4 py-2 rounded-xl text-xs font-bold transition-all border border-red-100"
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
          Salir de Consola
        </button>
      </header>

      {/* Sub-Header Actions & Tabs */}
      <div className="bg-white border-b border-gray-100 p-4 shrink-0 flex flex-col md:flex-row gap-4 md:items-center justify-between">
        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl self-start gap-1 overflow-x-auto w-full md:w-auto scrollbar-hide shrink-0">
          <button 
            onClick={() => { setActiveTab('lugares'); setBusqueda(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'lugares' ? 'bg-white text-forest-green shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5" />
            Lugares
          </button>
          <button 
            onClick={() => { setActiveTab('tablon'); setBusqueda(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'tablon' ? 'bg-white text-forest-green shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <FontAwesomeIcon icon={faFileLines} className="w-3.5 h-3.5" />
            Anuncios
          </button>
          <button 
            onClick={() => { setActiveTab('mercado'); setBusqueda(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'mercado' ? 'bg-white text-forest-green shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <FontAwesomeIcon icon={faShoppingBag} className="w-3.5 h-3.5" />
            Tienda
          </button>
          <button 
            onClick={() => { setActiveTab('eventos'); setBusqueda(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'eventos' ? 'bg-white text-forest-green shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <FontAwesomeIcon icon={faCalendarAlt} className="w-3.5 h-3.5" />
            Quedadas
          </button>
          <button 
            onClick={() => { setActiveTab('usuarios'); setBusqueda(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'usuarios' ? 'bg-white text-forest-green shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <FontAwesomeIcon icon={faUsers} className="w-3.5 h-3.5" />
            Usuarios
          </button>
        </div>

        {/* Global actions (Search & Create) */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:w-64">
            <input 
              type="text" 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={`Buscar en ${activeTab}...`}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
            />
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          </div>

          {/* Refresh button */}
          <button 
            onClick={cargarDatos}
            disabled={cargando}
            className="p-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
            title="Recargar datos"
          >
            <FontAwesomeIcon icon={faRotateRight} className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
          </button>

          {/* New Lugar Button */}
          {activeTab === 'lugares' && (
            <button 
              onClick={() => { setLugarParaEditar(null); setModalAbierto(true); }}
              className="flex items-center gap-1.5 bg-forest-green text-white hover:bg-green-700
                         px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-green-950/20 active:scale-98 transition-all shrink-0"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              Nuevo Lugar
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Table (Scrollable) */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
          {cargando ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <span className="w-8 h-8 border-3 border-forest-green/20 border-t-forest-green rounded-full animate-spin mb-3" />
              <p className="text-xs text-gray-500 font-semibold animate-pulse">Obteniendo información...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              {/* LUGARES TABLE */}
              {activeTab === 'lugares' && (
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-3.5">Foto</th>
                      <th className="px-6 py-3.5">Lugar</th>
                      <th className="px-6 py-3.5">Categoría</th>
                      <th className="px-6 py-3.5">Dirección</th>
                      <th className="px-6 py-3.5 text-center">Estado</th>
                      <th className="px-6 py-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {filtrarLugares.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-400 font-medium">No se han encontrado lugares.</td>
                      </tr>
                    ) : (
                      filtrarLugares.map(lugar => (
                        <tr key={lugar.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-3">
                            <img 
                              src={lugar.fotoUrl || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800'} 
                              alt={lugar.nombre} 
                              className="w-12 h-10 object-cover rounded-lg border border-gray-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800';
                              }}
                            />
                          </td>
                          <td className="px-6 py-3 font-semibold text-gray-900">{lugar.nombre}</td>
                          <td className="px-6 py-3 text-xs font-semibold">{traducirCategoria(lugar.categoria)}</td>
                          <td className="px-6 py-3 text-xs text-gray-500 max-w-[200px] truncate" title={lugar.direccion}>{lugar.direccion}</td>
                          <td className="px-6 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${
                              (lugar as any).aprobado !== false 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {(lugar as any).aprobado !== false ? 'Aprobado' : 'Pendiente'}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => { setLugarParaEditar(lugar.id); setModalAbierto(true); }}
                                className="p-1.5 rounded-lg text-forest-green hover:bg-green-50 transition-colors"
                                title="Editar"
                              >
                                <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEliminarLugar(lugar.id, lugar.nombre)}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                title="Eliminar"
                              >
                                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* ANUNCIOS TABLE */}
              {activeTab === 'tablon' && (
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-3.5">Tipo</th>
                      <th className="px-6 py-3.5">Título</th>
                      <th className="px-6 py-3.5">Contenido</th>
                      <th className="px-6 py-3.5">Autor</th>
                      <th className="px-6 py-3.5">Fecha</th>
                      <th className="px-6 py-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {filtrarPublicaciones.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-400 font-medium">No hay anuncios publicados.</td>
                      </tr>
                    ) : (
                      filtrarPublicaciones.map(post => {
                        const tipoCfg: Record<string, { bg: string; text: string; label: React.ReactNode }> = {
                          DUDA:  { bg: 'bg-blue-50',   text: 'text-blue-700',   label: <><FontAwesomeIcon icon={faCircleQuestion} className="w-3 h-3 inline mr-1" /> Duda</> },
                          INFO:  { bg: 'bg-emerald-50', text: 'text-emerald-700', label: <><FontAwesomeIcon icon={faInfoCircle} className="w-3 h-3 inline mr-1" /> Info</> },
                        };
                        const cfg = tipoCfg[post.tipo] || { bg: 'bg-gray-50', text: 'text-gray-600', label: post.tipo };
                        return (
                          <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.text}`}>
                                {cfg.label}
                              </span>
                            </td>
                            <td className="px-6 py-3 font-semibold text-gray-900 max-w-[180px] truncate" title={post.titulo}>{post.titulo}</td>
                            <td className="px-6 py-3 text-xs text-gray-500 max-w-[240px] truncate" title={post.contenido}>{post.contenido}</td>
                            <td className="px-6 py-3 text-xs font-semibold">{post.autorNombre || '—'}</td>
                            <td className="px-6 py-3 text-xs text-gray-400">
                              {new Date(post.creadoEn).toLocaleDateString('es-ES', { 
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                              })}
                            </td>
                            <td className="px-6 py-3 text-right">
                              <button 
                                onClick={() => handleEliminarPublicacion(post.id, post.titulo)}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                title="Eliminar publicación"
                              >
                                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}

              {/* MERCADO TABLE */}
              {activeTab === 'mercado' && (
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-3.5">Foto</th>
                      <th className="px-6 py-3.5">Producto</th>
                      <th className="px-6 py-3.5">Categoría</th>
                      <th className="px-6 py-3.5">Precio</th>
                      <th className="px-6 py-3.5 text-center">Estado</th>
                      <th className="px-6 py-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {filtrarAnuncios.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-400 font-medium">No hay productos en la tienda.</td>
                      </tr>
                    ) : (
                      filtrarAnuncios.map(anuncio => (
                        <tr key={anuncio.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-3">
                            <img 
                              src={anuncio.fotoUrl || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800'} 
                              alt={anuncio.titulo} 
                              className="w-12 h-10 object-cover rounded-lg border border-gray-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800';
                              }}
                            />
                          </td>
                          <td className="px-6 py-3 font-semibold text-gray-900">{anuncio.titulo}</td>
                          <td className="px-6 py-3 text-xs">{anuncio.categoria}</td>
                          <td className="px-6 py-3 font-bold text-gray-900">{anuncio.precio.toFixed(2)} €</td>
                          <td className="px-6 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${
                              anuncio.estado === 'DISPONIBLE' 
                                ? 'bg-green-50 text-green-700 border border-green-100' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {anuncio.estado}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <button 
                              onClick={() => handleEliminarAnuncio(anuncio.id, anuncio.titulo)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Eliminar producto"
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* EVENTOS TABLE */}
              {activeTab === 'eventos' && (
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-3.5">Quedada</th>
                      <th className="px-6 py-3.5">Fecha y Hora</th>
                      <th className="px-6 py-3.5">Ubicación</th>
                      <th className="px-6 py-3.5 text-center">Límite</th>
                      <th className="px-6 py-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {filtrarEventos.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-gray-400 font-medium">No se han programado quedadas.</td>
                      </tr>
                    ) : (
                      filtrarEventos.map(evento => (
                        <tr key={evento.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-3 font-semibold text-gray-900 max-w-[200px] truncate" title={evento.titulo}>{evento.titulo}</td>
                          <td className="px-6 py-3 text-xs text-gray-600 font-medium">
                            {new Date(evento.fecha + 'T' + evento.hora).toLocaleDateString('es-ES', { 
                              weekday: 'short', day: 'numeric', month: 'short' 
                            })} - {evento.hora.substring(0, 5)} h
                          </td>
                          <td className="px-6 py-3 text-xs text-gray-500 max-w-[200px] truncate" title={evento.ubicacion}>{evento.ubicacion}</td>
                          <td className="px-6 py-3 text-center text-xs font-bold text-gray-600">
                            {evento.maxParticipantes ? `${evento.maxParticipantes} perros` : 'Sin límite'}
                          </td>
                          <td className="px-6 py-3 text-right">
                            <button 
                              onClick={() => handleEliminarEvento(evento.id, evento.titulo)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Eliminar quedada"
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* USUARIOS TABLE */}
              {activeTab === 'usuarios' && (
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-3.5">ID</th>
                      <th className="px-6 py-3.5">Nombre</th>
                      <th className="px-6 py-3.5">Email</th>
                      <th className="px-6 py-3.5 text-center">Rol</th>
                      <th className="px-6 py-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {filtrarUsuarios.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-gray-400 font-medium">No se han encontrado usuarios.</td>
                      </tr>
                    ) : (
                      filtrarUsuarios.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-3 font-semibold text-gray-500">{u.id}</td>
                          <td className="px-6 py-3 font-semibold text-gray-900 max-w-[200px] truncate">{u.nombre}</td>
                          <td className="px-6 py-3 text-xs text-gray-600 max-w-[200px] truncate">{u.email}</td>
                          <td className="px-6 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${
                              u.rol === 'ROL_ADMIN' 
                                ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {u.rol === 'ROL_ADMIN' ? 'Administrador' : 'Usuario'}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            {u.rol !== 'ROL_ADMIN' && (
                              <button 
                                onClick={() => handleHacerAdmin(u.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-forest-green border border-forest-green/30 hover:bg-forest-green hover:text-white transition-colors"
                              >
                                Hacer Admin
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal / Formulario Lugar CRUD */}
      {modalAbierto && (
        <FormularioLugar 
          lugarId={lugarParaEditar} 
          onClose={() => setModalAbierto(false)} 
          onSave={() => {
            setModalAbierto(false);
            cargarDatos();
          }}
        />
      )}
    </div>
  );
};

// ── ENRUTADOR SEGURO DE ADMINISTRACIÓN ───────────────────────────────────────
const PanelAdministrador = () => {
  const { isAuthenticated, user } = useUserStore();

  // Verifica si está autenticado como administrador
  const esAdmin = isAuthenticated && user?.role === 'ROL_ADMIN';

  return (
    <Routes>
      <Route path="login" element={!esAdmin ? <IniciarSesionAdmin /> : <Navigate to="/admin/dashboard" replace />} />
      <Route path="dashboard" element={esAdmin ? <DashboardAdmin /> : <Navigate to="/admin/login" replace />} />
      <Route path="*" element={<Navigate to={esAdmin ? "dashboard" : "login"} replace />} />
    </Routes>
  );
};

export default PanelAdministrador;
