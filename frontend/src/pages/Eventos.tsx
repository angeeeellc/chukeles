import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faTrash, faXmark, faLocationDot, faUsers, faCalendarAlt, faClock,
  faSpinner, faRotateRight, faAlignLeft, faFont, faCheckCircle, faDog,
  faSearch, faChevronLeft, faChevronRight, faFilter
} from '@fortawesome/free-solid-svg-icons';
import { useUserStore } from '../store/storeUsuario';
import { useUiStore } from '../store/storeUi';
import {
  fetchEventos, crearEvento, actualizarEvento, unirseEvento, salirEvento, eliminarEvento,
  type Evento, type NuevoEvento
} from '../services/servicioEvento';
import Footer from '../components/Footer';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
const formatFecha = (fechaStr: string): string => {
  const fecha = new Date(fechaStr + 'T00:00:00');
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
};

const formatHora = (horaStr: string): string => {
  return horaStr.substring(0, 5) + ' h';
};

const esPasado = (fechaStr: string): boolean => {
  return new Date(fechaStr + 'T23:59:59') < new Date();
};
interface TarjetaEventoProps {
  evento: Evento;
  usuarioId?: number;
  esAdmin: boolean;
  cargandoId: number | null;
  onUnirse: (id: number) => void;
  onSalir: (id: number) => void;
  onEliminar: (id: number, titulo: string) => void;
  onVerDetalle: (evento: Evento) => void;
  onEditar: (evento: Evento) => void;
}

const TarjetaEvento = ({ evento, usuarioId, esAdmin, cargandoId, onUnirse, onSalir, onEliminar, onVerDetalle, onEditar }: TarjetaEventoProps) => {
  const esAutor = evento.autorId === usuarioId;
  const puedeEliminar = esAdmin || esAutor;
  const pasado = esPasado(evento.fecha);
  const cargando = cargandoId === evento.id;

  const aforo = evento.maxParticipantes
    ? `${evento.numParticipantes}/${evento.maxParticipantes} perros`
    : `${evento.numParticipantes} perro${evento.numParticipantes !== 1 ? 's' : ''}`;

  const aforoCompleto = evento.maxParticipantes !== null && evento.maxParticipantes !== undefined
    && evento.numParticipantes >= evento.maxParticipantes;

  return (
    <article
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer ${
        pasado ? 'border-gray-100 opacity-60' : 'border-gray-100'
      }`}
      onClick={() => onVerDetalle(evento)}
    >
      {/* Cabecera con fecha destacada */}
      <div className={`px-5 pt-5 pb-3 border-b border-gray-100 ${
        pasado ? 'bg-gray-50' : 'bg-gradient-to-r from-green-50 to-emerald-50'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold text-forest-green mb-1.5">
              <FontAwesomeIcon icon={faCalendarAlt} className="w-3.5 h-3.5 shrink-0" />
              <span className="capitalize truncate">{formatFecha(evento.fecha)}</span>
            </div>
            <h2 className="font-black text-gray-900 text-base leading-tight line-clamp-2">{evento.titulo}</h2>
          </div>

          {/* Aforo */}
          <div className={`shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-center ${
            aforoCompleto ? 'bg-red-50' : 'bg-green-100'
          }`}>
            <FontAwesomeIcon icon={faUsers} className={`w-4 h-4 mb-0.5 ${aforoCompleto ? 'text-red-500' : 'text-green-700'}`} />
            <span className={`text-[10px] font-black leading-tight ${aforoCompleto ? 'text-red-600' : 'text-green-800'}`}>
              {evento.numParticipantes}
              {evento.maxParticipantes ? `/${evento.maxParticipantes}` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="px-5 py-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <FontAwesomeIcon icon={faClock} className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <span className="font-semibold">{formatHora(evento.hora)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <span className="truncate">{evento.ubicacion}</span>
        </div>

        {evento.descripcion && (
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 pt-1">{evento.descripcion}</p>
        )}

        {/* Organizador + aforo texto */}
        <div className="flex items-center justify-between pt-1 text-xs text-gray-400">
          <span>Organiza: <span className="font-semibold text-gray-600">{evento.autorNombre || 'Anónimo'}</span></span>
          <span className={`font-semibold ${aforoCompleto ? 'text-red-500' : 'text-gray-400'}`}>{aforo}</span>
        </div>
      </div>

      {/* Footer con acciones */}
      <div className="px-5 pb-5 flex items-center gap-2">
        {!pasado && usuarioId && (
          evento.estaApuntado ? (
            <button
              onClick={(ev) => { ev.stopPropagation(); onSalir(evento.id); }}
              disabled={cargando}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-bold hover:bg-emerald-100 transition-all disabled:opacity-60"
            >
              {cargando
                ? <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                : <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
              }
              Ya me apunté
            </button>
          ) : (
            <button
              onClick={(ev) => { ev.stopPropagation(); onUnirse(evento.id); }}
              disabled={cargando || aforoCompleto}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-forest-green text-white text-sm font-bold hover:bg-green-700 active:scale-98 transition-all shadow-sm shadow-green-200 disabled:opacity-60"
            >
              {cargando
                ? <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                : <FontAwesomeIcon icon={faUsers} className="w-4 h-4" />
              }
              {aforoCompleto ? 'Aforo completo' : 'Apuntarme'}
            </button>
          )
        )}

        {pasado && (
          <span className="flex-1 text-center text-xs font-semibold text-gray-400 py-2.5">Quedada finalizada</span>
        )}

        {esAutor && !pasado && (
          <button
            onClick={(ev) => { ev.stopPropagation(); onEditar(evento); }}
            className="p-2 rounded-xl text-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            title="Editar quedada"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
        )}

        {puedeEliminar && (
          <button
            onClick={(ev) => { ev.stopPropagation(); onEliminar(evento.id, evento.titulo); }}
            className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Eliminar quedada"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        )}
      </div>
    </article>
  );
};
interface ModalCrearProps {
  eventoEditar?: Evento | null;
  onClose: () => void;
  onCreado: () => void;
}

const ModalCrear = ({ eventoEditar, onClose, onCreado }: ModalCrearProps) => {
  const { addToast } = useUiStore();
  const hoy = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState<NuevoEvento>({
    titulo: eventoEditar?.titulo || '',
    fecha: eventoEditar?.fecha || hoy,
    hora: eventoEditar?.hora ? eventoEditar.hora.substring(0, 5) : '11:00',
    ubicacion: eventoEditar?.ubicacion || '',
    lat: eventoEditar?.lat,
    lng: eventoEditar?.lng,
    maxParticipantes: eventoEditar?.maxParticipantes,
    descripcion: eventoEditar?.descripcion || '',
  });
  const [enviando, setEnviando] = useState(false);

  const set = (campo: keyof NuevoEvento, valor: string | number | undefined) =>
    setForm(prev => ({ ...prev, [campo]: valor }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) { addToast('El título es obligatorio.', 'error'); return; }
    if (!form.fecha) { addToast('La fecha es obligatoria.', 'error'); return; }
    if (!form.hora) { addToast('La hora es obligatoria.', 'error'); return; }
    if (!form.ubicacion.trim()) { addToast('La ubicación es obligatoria.', 'error'); return; }
    if (form.fecha < hoy) { addToast('La fecha debe ser hoy o futura.', 'error'); return; }

    setEnviando(true);
    try {
      const payload = { ...form, hora: form.hora + ':00' };
      if (eventoEditar) {
        await actualizarEvento(eventoEditar.id, payload);
        addToast('¡Quedada actualizada correctamente!', 'success');
      } else {
        await crearEvento(payload);
        addToast('¡Quedada creada correctamente!', 'success');
      }
      onCreado();
    } catch {
      addToast(eventoEditar ? 'No se pudo actualizar la quedada.' : 'No se pudo crear la quedada.', 'error');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="w-5 h-5 text-forest-green" />
            {eventoEditar ? 'Editar quedada' : 'Organizar quedada'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Título */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faFont} className="w-3.5 h-3.5" /> Nombre de la quedada *
            </label>
            <input
              type="text"
              value={form.titulo}
              onChange={e => set('titulo', e.target.value)}
              placeholder="Ej: Quedada canina en la playa de Riazor"
              maxLength={120}
              className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
            />
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faCalendarAlt} className="w-3.5 h-3.5" /> Fecha *
              </label>
              <input
                type="date"
                min={hoy}
                value={form.fecha}
                onChange={e => set('fecha', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faClock} className="w-3.5 h-3.5" /> Hora *
              </label>
              <input
                type="time"
                value={form.hora}
                onChange={e => set('hora', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
              />
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5" /> Lugar de encuentro *
            </label>
            <input
              type="text"
              value={form.ubicacion}
              onChange={e => set('ubicacion', e.target.value)}
              placeholder="Ej: Playa de Riazor, A Coruña"
              className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
            />
          </div>

          {/* Máximo de participantes */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faUsers} className="w-3.5 h-3.5" /> Máx. de perros (opcional)
            </label>
            <input
              type="number"
              min="2"
              max="500"
              value={form.maxParticipantes ?? ''}
              onChange={e => set('maxParticipantes', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Sin límite"
              className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faAlignLeft} className="w-3.5 h-3.5" /> Descripción (opcional)
            </label>
            <textarea
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              placeholder="Detalles adicionales, qué llevar, etc."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-100 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="flex-1 py-2.5 rounded-xl bg-forest-green text-white text-sm font-bold shadow-md shadow-green-950/20 hover:bg-green-700 active:scale-98 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {enviando && <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />}
              {eventoEditar ? 'Guardar cambios' : 'Crear quedada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
const SkeletonEvento = () => (
  <div className="bg-white rounded-2xl border border-gray-100 animate-pulse overflow-hidden">
    <div className="px-5 pt-5 pb-3 bg-green-50/50 border-b border-gray-100">
      <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
      <div className="h-5 bg-gray-100 rounded w-3/4" />
    </div>
    <div className="px-5 py-4 space-y-2">
      <div className="h-3 bg-gray-100 rounded w-1/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-full" />
    </div>
    <div className="px-5 pb-5">
      <div className="h-10 bg-gray-100 rounded-xl" />
    </div>
  </div>
);
const Eventos = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUserStore();
  const { addToast } = useUiStore();

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargandoId, setCargandoId] = useState<number | null>(null);
  const [eventoDetalle, setEventoDetalle] = useState<Evento | null>(null);
  const [eventoEditar, setEventoEditar] = useState<Evento | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [tabActivo, setTabActivo] = useState<'proximas' | 'pasadas'>('proximas');

  const esAdmin = user?.role === 'ROL_ADMIN';

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await fetchEventos();
      setEventos(data);
    } catch {
      addToast('Error al cargar las quedadas.', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); setCurrentPage(1); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filtroFechaDesde, filtroFechaHasta, tabActivo]);

  const handleOrganizar = () => {
    if (!isAuthenticated) { navigate('/iniciar-sesion'); return; }
    setEventoEditar(null);
    setModalAbierto(true);
  };

  const handleEditar = (evento: Evento) => {
    setEventoEditar(evento);
    setModalAbierto(true);
  };

  const handleUnirse = async (id: number) => {
    if (!isAuthenticated) { navigate('/iniciar-sesion'); return; }
    setCargandoId(id);
    try {
      await unirseEvento(id);
      addToast('¡Te has apuntado a la quedada!', 'success');
      // Actualiza solo el evento modificado
      setEventos(prev => prev.map(e =>
        e.id === id ? { ...e, estaApuntado: true, numParticipantes: e.numParticipantes + 1 } : e
      ));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      addToast(msg || 'No se pudo unirse a la quedada.', 'error');
    } finally {
      setCargandoId(null);
    }
  };

  const handleSalir = async (id: number) => {
    setCargandoId(id);
    try {
      await salirEvento(id);
      addToast('Te has salido de la quedada.', 'info');
      setEventos(prev => prev.map(e =>
        e.id === id ? { ...e, estaApuntado: false, numParticipantes: Math.max(0, e.numParticipantes - 1) } : e
      ));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      addToast(msg || 'No se pudo salir de la quedada.', 'error');
    } finally {
      setCargandoId(null);
    }
  };

  const handleEliminar = async (id: number, titulo: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${titulo}"?`)) return;
    try {
      await eliminarEvento(id);
      addToast('Quedada eliminada.', 'success');
      setEventos(prev => prev.filter(e => e.id !== id));
    } catch {
      addToast('No se pudo eliminar la quedada.', 'error');
    }
  };

  let eventosProximos = eventos.filter(e => !esPasado(e.fecha));
  let eventosPasados = eventos.filter(e => esPasado(e.fecha));

  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    const matches = (e: Evento) =>
      e.titulo.toLowerCase().includes(q) ||
      e.ubicacion.toLowerCase().includes(q) ||
      (e.descripcion && e.descripcion.toLowerCase().includes(q)) ||
      (e.autorNombre && e.autorNombre.toLowerCase().includes(q));

    eventosProximos = eventosProximos.filter(matches);
    eventosPasados = eventosPasados.filter(matches);
  }

  if (filtroFechaDesde) {
    eventosProximos = eventosProximos.filter(e => e.fecha >= filtroFechaDesde);
    eventosPasados = eventosPasados.filter(e => e.fecha >= filtroFechaDesde);
  }
  if (filtroFechaHasta) {
    eventosProximos = eventosProximos.filter(e => e.fecha <= filtroFechaHasta);
    eventosPasados = eventosPasados.filter(e => e.fecha <= filtroFechaHasta);
  }

  const itemsPerPage = 6;
  const eventosActivos = tabActivo === 'proximas' ? eventosProximos : eventosPasados;
  const totalPages = Math.max(1, Math.ceil(eventosActivos.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const currentEventos = eventosActivos.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="h-full w-full overflow-y-auto bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b-4 border-forest-green/30">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-2xl bg-forest-green flex items-center justify-center mr-4 shadow-md border border-forest-green/30">
                  <FontAwesomeIcon icon={faDog} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-gray-900">Quedadas Caninas</h1>
                  <p className="text-gray-500 text-sm font-medium">
                    Encuentra compañeros de paseo en A Coruña y organiza tus propios encuentros
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleOrganizar}
              className="self-start sm:self-auto inline-flex items-center gap-2 bg-forest-green text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:bg-green-700 active:scale-95 transition-all text-sm"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              Organizar quedada
            </button>
          </div>

          {/* Stats */}
          {!cargando && (
            <div className="flex gap-6 mt-6">
              <div className="text-center">
                <p className="text-2xl font-black text-gray-900">{eventosProximos.length}</p>
                <p className="text-xs text-forest-green font-semibold">Próximas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-gray-900">
                  {eventosProximos.reduce((acc, e) => acc + e.numParticipantes, 0)}
                </p>
                <p className="text-xs text-forest-green font-semibold">Perros apuntados</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filtros — igual que Anuncios: barra sticky con pills horizontales */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex gap-2 overflow-x-auto scrollbar-hide items-center justify-start md:justify-start">

          {/* Pill: Próximas */}
          <button
            id="filtro-proximas"
            onClick={() => setTabActivo('proximas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all shrink-0 ${
              tabActivo === 'proximas'
                ? 'bg-forest-green text-white border-forest-green shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-forest-green hover:text-forest-green'
            }`}
          >
            <FontAwesomeIcon icon={faCalendarAlt} className="w-3.5 h-3.5" />
            Próximas
            {!cargando && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                tabActivo === 'proximas' ? 'bg-white/30 text-white' : 'bg-green-100 text-forest-green'
              }`}>
                {eventosProximos.length}
              </span>
            )}
          </button>

          {/* Pill: Pasadas */}
          <button
            id="filtro-pasadas"
            onClick={() => setTabActivo('pasadas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all shrink-0 ${
              tabActivo === 'pasadas'
                ? 'bg-gray-700 text-white border-gray-700 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-500 hover:text-gray-700'
            }`}
          >
            <FontAwesomeIcon icon={faRotateRight} className="w-3.5 h-3.5" />
            Pasadas
            {!cargando && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                tabActivo === 'pasadas' ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {eventosPasados.length}
              </span>
            )}
          </button>

          {/* Separador */}
          <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />

          {/* Buscador */}
          <div className="relative flex items-center shrink-0">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Buscar quedada o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 py-1.5 rounded-full text-xs font-semibold border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent w-40 sm:w-56 transition-all"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filtro de fecha */}
          <div className="flex items-center gap-1.5 shrink-0">
            <FontAwesomeIcon icon={faFilter} className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400 font-semibold">Desde</span>
            <input
              type="date"
              value={filtroFechaDesde}
              onChange={e => setFiltroFechaDesde(e.target.value)}
              className="px-2 py-1 rounded-lg text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent transition-all"
            />
            <span className="text-xs text-gray-400 font-semibold">Hasta</span>
            <input
              type="date"
              value={filtroFechaHasta}
              min={filtroFechaDesde || undefined}
              onChange={e => setFiltroFechaHasta(e.target.value)}
              className="px-2 py-1 rounded-lg text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent transition-all"
            />
            {(filtroFechaDesde || filtroFechaHasta) && (
              <button
                onClick={() => { setFiltroFechaDesde(''); setFiltroFechaHasta(''); }}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Limpiar filtro de fecha"
              >
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Recargar */}
          <button
            onClick={cargar}
            disabled={cargando}
            title="Recargar quedadas"
            className="shrink-0 ml-auto p-2 rounded-full border border-gray-100 text-forest-green hover:bg-green-50 transition-colors bg-white"
          >
            <FontAwesomeIcon icon={faRotateRight} className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {cargando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonEvento key={i} />)}
          </div>
        ) : eventosActivos.length === 0 ? (
          <div className="text-center py-20">
            <FontAwesomeIcon icon={faDog} className="w-16 h-16 text-forest-green/50 mx-auto mb-4" />
            {tabActivo === 'proximas' ? (
              <>
                <h3 className="text-lg font-bold text-gray-700 mb-1">No hay quedadas programadas</h3>
                <p className="text-sm text-gray-400 mb-6">¡Organiza la primera quedada canina!</p>
                <button
                  onClick={handleOrganizar}
                  className="inline-flex items-center gap-2 bg-forest-green text-white font-bold px-6 py-3 rounded-2xl shadow-md hover:bg-green-700 transition-all text-sm"
                >
                  <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                  Organizar quedada
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-700 mb-1">No hay quedadas pasadas</h3>
                <p className="text-sm text-gray-400">Aquí aparecerán las quedadas que ya han finalizado.</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${
              tabActivo === 'pasadas' ? 'opacity-80' : ''
            }`}>
              {currentEventos.map(e => (
                <TarjetaEvento
                  key={e.id}
                  evento={e}
                  usuarioId={user?.id}
                  esAdmin={esAdmin}
                  cargandoId={cargandoId}
                  onUnirse={handleUnirse}
                  onSalir={handleSalir}
                  onEliminar={handleEliminar}
                  onVerDetalle={setEventoDetalle}
                  onEditar={handleEditar}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                  disabled={safeCurrentPage === 1}
                  className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold text-gray-600 px-4">
                  Página {safeCurrentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />

      {/* Modal crear / editar */}
      {modalAbierto && (
        <ModalCrear
          eventoEditar={eventoEditar}
          onClose={() => { setModalAbierto(false); setEventoEditar(null); }}
          onCreado={() => { setModalAbierto(false); setEventoEditar(null); cargar(); }}
        />
      )}

      {/* Modal detalle evento */}
      {eventoDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEventoDetalle(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-forest-green to-green-700 px-6 py-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 text-green-200 text-xs font-semibold mb-1">
                    <FontAwesomeIcon icon={faCalendarAlt} className="w-3.5 h-3.5" />
                    <span className="capitalize">{formatFecha(eventoDetalle.fecha)} &middot; {formatHora(eventoDetalle.hora)}</span>
                  </div>
                  <h2 className="text-xl font-black leading-tight">{eventoDetalle.titulo}</h2>
                  <p className="text-green-200 text-sm mt-1">Organiza: <span className="font-bold text-white">{eventoDetalle.autorNombre || 'Anónimo'}</span></p>
                </div>
                <button onClick={() => setEventoDetalle(null)} className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
                  <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 text-forest-green" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ubicación</p>
                  <p className="text-sm font-semibold text-gray-800">{eventoDetalle.ubicacion}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faUsers} className="w-4 h-4 text-forest-green" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Participantes</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {eventoDetalle.numParticipantes} {eventoDetalle.maxParticipantes ? `/ ${eventoDetalle.maxParticipantes}` : ''} perros apuntados
                  </p>
                </div>
              </div>
              {eventoDetalle.descripcion && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faAlignLeft} className="w-4 h-4 text-forest-green" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descripción</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{eventoDetalle.descripcion}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setEventoDetalle(null)}
                className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Eventos;
