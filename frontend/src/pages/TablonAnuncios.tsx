import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleQuestion, faInfoCircle, faPlus, faTrash,
  faXmark, faUpload, faImage, faPhone, faAlignLeft, faFont,
  faSpinner, faRotateRight, faClipboardList, faGrip,
  faSearch, faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { useUserStore } from '../store/storeUsuario';
import { useUiStore } from '../store/storeUi';
import {
  fetchPublicaciones, crearPublicacion, actualizarPublicacion, eliminarPublicacion,
  type PublicacionTablon, type TipoPublicacion, type NuevaPublicacion
} from '../services/servicioTablon';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import clienteApi from '../services/clienteApi';
import Footer from '../components/Footer';
const tiempoRelativo = (fechaStr: string): string => {
  const ahora = new Date();
  const fecha = new Date(fechaStr);
  const diffMs = ahora.getTime() - fecha.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'ahora mismo';
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `hace ${diffD} días`;
  return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

const TIPO_CONFIG: Record<TipoPublicacion, { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
  DUDA: {
    label: 'Duda',
    icon: <FontAwesomeIcon icon={faCircleQuestion} className="w-3.5 h-3.5" />,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  INFO: {
    label: 'Info',
    icon: <FontAwesomeIcon icon={faInfoCircle} className="w-3.5 h-3.5" />,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
};
const BadgeTipo = ({ tipo }: { tipo: TipoPublicacion }) => {
  const cfg = TIPO_CONFIG[tipo];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};
interface TarjetaProps {
  pub: PublicacionTablon;
  usuarioId?: number;
  esAdmin: boolean;
  onEliminar: (id: number, titulo: string) => void;
  onVerDetalle: (pub: PublicacionTablon) => void;
  onEditar: (pub: PublicacionTablon) => void;
}

const TarjetaAnuncio = ({ pub, usuarioId, esAdmin, onEliminar, onVerDetalle, onEditar }: TarjetaProps) => {
  const esAutor = pub.autorId === usuarioId;
  const puedeEliminar = esAdmin || esAutor;

  return (
    <article
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
      onClick={() => onVerDetalle(pub)}
    >
      {/* Foto si existe */}
      {pub.fotoUrl && (
        <div className="h-48 overflow-hidden">
          <img
            src={pub.fotoUrl}
            alt={pub.titulo}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="p-5">
        {/* Cabecera: tipo + tiempo */}
        <div className="flex items-center justify-between mb-3">
          <BadgeTipo tipo={pub.tipo} />
          <span className="text-xs text-gray-400 font-medium">{tiempoRelativo(pub.creadoEn)}</span>
        </div>

        {/* Título */}
        <h2 className="font-bold text-gray-900 text-base mb-2 leading-snug">{pub.titulo}</h2>

        {/* Contenido — recortado, ver más en modal */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{pub.contenido}</p>

        {/* Footer: autor + contacto + acción */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {pub.autorNombre && (
              <p className="text-xs font-semibold text-gray-700 truncate">
                {pub.autorNombre}
              </p>
            )}
            {pub.infoContacto && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                <FontAwesomeIcon icon={faPhone} className="w-3 h-3 shrink-0" />
                {pub.infoContacto}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {esAutor && (
              <button
                onClick={(ev) => { ev.stopPropagation(); onEditar(pub); }}
                title="Editar publicación"
                className="shrink-0 p-1.5 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              >
                <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
              </button>
            )}
            {puedeEliminar && (
            <button
              onClick={(ev) => { ev.stopPropagation(); onEliminar(pub.id, pub.titulo); }}
              title="Eliminar publicación"
              className="shrink-0 p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
            </button>
          )}
          </div>
        </div>
      </div>
    </article>
  );
};
interface ModalPublicarProps {
  publicacionEditar?: PublicacionTablon | null;
  onClose: () => void;
  onPublicado: () => void;
}

const ModalPublicar = ({ publicacionEditar, onClose, onPublicado }: ModalPublicarProps) => {
  const { addToast } = useUiStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<NuevaPublicacion>({
    titulo: publicacionEditar?.titulo || '',
    contenido: publicacionEditar?.contenido || '',
    tipo: publicacionEditar?.tipo || 'INFO',
    fotoUrl: publicacionEditar?.fotoUrl || '',
    infoContacto: publicacionEditar?.infoContacto || '',
  });
  const [previewFoto, setPreviewFoto] = useState<string | null>(publicacionEditar?.fotoUrl || null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const handleCampoTexto = (campo: keyof NuevaPublicacion, valor: string) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoFoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await clienteApi.post<{ url: string }>('/fotos/subir', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = response.data.url;
      setForm(prev => ({ ...prev, fotoUrl: url }));
      setPreviewFoto(url);
    } catch {
      addToast('No se pudo subir la imagen. Inténtalo de nuevo.', 'error');
    } finally {
      setSubiendoFoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.contenido.trim()) {
      addToast('El título y el contenido son obligatorios.', 'error');
      return;
    }

    setEnviando(true);
    try {
      const datos: NuevaPublicacion = { ...form };
      if (publicacionEditar) {
        await actualizarPublicacion(publicacionEditar.id, datos);
        addToast('¡Anuncio actualizado correctamente!', 'success');
      } else {
        await crearPublicacion(datos);
        addToast('¡Anuncio publicado correctamente!', 'success');
      }
      onPublicado();
    } catch {
      addToast(publicacionEditar ? 'No se pudo actualizar el anuncio. Inténtalo de nuevo.' : 'No se pudo publicar el anuncio. Inténtalo de nuevo.', 'error');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">
            {publicacionEditar ? 'Editar anuncio' : 'Publicar anuncio'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Tipo */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">
              Tipo de anuncio
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['INFO', 'DUDA'] as TipoPublicacion[]).map(t => {
                const cfg = TIPO_CONFIG[t];
                const activo = form.tipo === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, tipo: t }))}
                    className={`flex flex-col items-center gap-1.5 py-2 px-2 rounded-xl border-2 text-xs font-bold transition-all ${
                      activo
                        ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm`
                        : 'border-gray-100 text-gray-400 hover:border-gray-100'
                    }`}
                  >
                    <span className={activo ? cfg.text : 'text-gray-400'}>{cfg.icon}</span>
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faFont} className="w-3.5 h-3.5" /> Título *
            </label>
            <input
              type="text"
              value={form.titulo}
              onChange={e => handleCampoTexto('titulo', e.target.value)}
              placeholder="Ej: Busco veterinario para gato de 10 años..."
              className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
              maxLength={120}
            />
          </div>

          {/* Contenido */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faAlignLeft} className="w-3.5 h-3.5" /> Descripción *
            </label>
            <textarea
              value={form.contenido}
              onChange={e => handleCampoTexto('contenido', e.target.value)}
              placeholder="Explica tu anuncio con detalle..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent resize-none"
            />
          </div>

          {/* Info de contacto */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faPhone} className="w-3.5 h-3.5" /> Contacto (opcional)
            </label>
            <input
              type="text"
              value={form.infoContacto ?? ''}
              onChange={e => handleCampoTexto('infoContacto', e.target.value)}
              placeholder="Teléfono, email o Instagram..."
              className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
            />
          </div>

          {/* Foto */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faImage} className="w-3.5 h-3.5" /> Foto (opcional)
            </label>
            {previewFoto ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-100">
                <img src={previewFoto} alt="Preview" className="w-full h-24 object-cover" />
                <button
                  type="button"
                  onClick={() => { setPreviewFoto(null); setForm(prev => ({ ...prev, fotoUrl: '' })); }}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={subiendoFoto}
                className="w-full flex flex-col items-center gap-1.5 py-4 rounded-xl border-2 border-dashed border-gray-100 hover:border-forest-green text-gray-400 hover:text-gray-400 transition-colors"
              >
                {subiendoFoto
                  ? <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 animate-spin" />
                  : <FontAwesomeIcon icon={faUpload} className="w-6 h-6" />
                }
                <span className="text-xs font-semibold">
                  {subiendoFoto ? 'Subiendo imagen...' : 'Subir imagen (JPG/PNG, máx. 5MB)'}
                </span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFoto}
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
              className="flex-1 py-2.5 rounded-xl bg-forest-green text-white text-sm font-bold
                         shadow-md shadow-green-950/20 hover:bg-green-700 active:scale-98
                         transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {enviando && <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />}
              {publicacionEditar ? 'Guardar cambios' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
const FILTROS: { label: React.ReactNode; valor: TipoPublicacion | null }[] = [
  { label: <><FontAwesomeIcon icon={faGrip} className="w-3.5 h-3.5 inline mr-1" /> Todos</>, valor: null },
  { label: <><FontAwesomeIcon icon={faCircleQuestion} className="w-3.5 h-3.5 inline mr-1" /> Dudas</>, valor: 'DUDA' },
  { label: <><FontAwesomeIcon icon={faInfoCircle} className="w-3.5 h-3.5 inline mr-1" /> Info</>, valor: 'INFO' },
];

const TablonAnuncios = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUserStore();
  const { addToast } = useUiStore();

  const [publicaciones, setPublicaciones] = useState<PublicacionTablon[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<TipoPublicacion | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [publicacionDetalle, setPublicacionDetalle] = useState<PublicacionTablon | null>(null);
  const [publicacionEditar, setPublicacionEditar] = useState<PublicacionTablon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const esAdmin = user?.role === 'ROL_ADMIN';

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await fetchPublicaciones(filtro ?? undefined);
      setPublicaciones(data);
    } catch {
      addToast('Error al cargar los anuncios.', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    setCurrentPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const handlePublicar = () => {
    if (!isAuthenticated) {
      navigate('/iniciar-sesion');
      return;
    }
    setPublicacionEditar(null);
    setModalAbierto(true);
  };

  const handleEditar = (pub: PublicacionTablon) => {
    setPublicacionEditar(pub);
    setModalAbierto(true);
  };

  const handleEliminar = async (id: number, titulo: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${titulo}"?`)) return;
    try {
      await eliminarPublicacion(id);
      addToast('Publicación eliminada.', 'success');
      cargar();
    } catch {
      addToast('No se pudo eliminar la publicación.', 'error');
    }
  };
  let pubsFiltradas = publicaciones;
  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    pubsFiltradas = pubsFiltradas.filter(p =>
      p.titulo.toLowerCase().includes(q) ||
      p.contenido.toLowerCase().includes(q) ||
      (p.autorNombre && p.autorNombre.toLowerCase().includes(q))
    );
  }

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(pubsFiltradas.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const currentItems = pubsFiltradas.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="h-full w-full overflow-y-auto bg-gray-50">
      {/* Hero Header */}
      <div className="bg-white border-b-4 border-forest-green/30">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-2xl bg-forest-green flex items-center justify-center mr-4 shadow-md border border-forest-green/30">
                  <FontAwesomeIcon icon={faClipboardList} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-gray-900">Anuncios</h1>
                  <p className="text-gray-500 text-sm font-medium">
                    La comunidad perruna de A Coruña — comparte dudas e información
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handlePublicar}
              className="inline-flex items-center gap-2 bg-forest-green text-white
                         font-bold px-6 py-3 rounded-2xl shadow-lg hover:bg-green-700
                         active:scale-95 transition-all text-sm"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              Publicar anuncio
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex gap-2 overflow-x-auto scrollbar-hide items-center justify-start md:justify-center">
          {FILTROS.map(f => {
            const activo = filtro === f.valor;
            return (
              <button
                key={String(f.valor)}
                onClick={() => setFiltro(f.valor)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all shrink-0 ${
                  activo
                    ? 'bg-forest-green text-white border-forest-green shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-forest-green hover:text-forest-green'
                }`}
              >
                {f.label}
              </button>
            )
          })}

          <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />

          {/* Buscador */}
          <div className="relative flex items-center shrink-0">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 text-gray-400 w-3.5 h-3.5" />
            <input 
              type="text" 
              placeholder="Buscar anuncio o usuario..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent w-40 sm:w-64 transition-all"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={cargar}
            disabled={cargando}
            title="Recargar anuncios"
            className="shrink-0 ml-auto p-2 rounded-full border border-gray-100 text-forest-green hover:bg-green-50 transition-colors bg-white"
          >
            <FontAwesomeIcon icon={faRotateRight} className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {cargando ? (
          // Skeleton loader
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-5 w-16 bg-gray-100 rounded-full" />
                  <div className="h-3 w-20 bg-gray-100 rounded-full" />
                </div>
                <div className="h-5 w-3/4 bg-gray-100 rounded-lg mb-2" />
                <div className="h-3 w-full bg-gray-100 rounded-lg mb-1" />
                <div className="h-3 w-2/3 bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : currentItems.length === 0 ? (
          // Estado vacío
          <div className="text-center py-20">
            <div className="flex justify-center mb-4 text-gray-400">
              {filtro === 'DUDA' ? <FontAwesomeIcon icon={faCircleQuestion} className="w-16 h-16" /> : filtro === 'INFO' ? <FontAwesomeIcon icon={faInfoCircle} className="w-16 h-16" /> : <FontAwesomeIcon icon={faClipboardList} className="w-16 h-16" />}
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">
              {searchTerm 
                ? 'No se encontraron anuncios que coincidan con tu búsqueda'
                : filtro 
                  ? `No hay anuncios de tipo "${TIPO_CONFIG[filtro].label}"` 
                  : 'No hay anuncios'}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              {!searchTerm && (isAuthenticated ? '¡Sé el primero en publicar!' : 'Inicia sesión para publicar.')}
            </p>
            {!searchTerm && (
              <button
                onClick={handlePublicar}
                className="inline-flex items-center gap-2 bg-forest-green text-white font-bold
                           px-6 py-3 rounded-2xl shadow-md hover:bg-green-700 transition-all text-sm"
              >
                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                Publicar anuncio
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Grid de tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentItems.map(pub => (
                <TarjetaAnuncio
                  key={pub.id}
                  pub={pub}
                  usuarioId={user?.id}
                  esAdmin={esAdmin}
                  onEliminar={handleEliminar}
                  onVerDetalle={setPublicacionDetalle}
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
                  className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold text-gray-600 px-4">
                  Página {safeCurrentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />

      {/* Modal publicar / editar */}
      {modalAbierto && (
        <ModalPublicar
          publicacionEditar={publicacionEditar}
          onClose={() => { setModalAbierto(false); setPublicacionEditar(null); }}
          onPublicado={() => { setModalAbierto(false); setPublicacionEditar(null); cargar(); }}
        />
      )}

      {/* Modal detalle anuncio */}
      {publicacionDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPublicacionDetalle(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="mb-2"><BadgeTipo tipo={publicacionDetalle.tipo} /></div>
                  <h2 className="text-xl font-black leading-tight">{publicacionDetalle.titulo}</h2>
                  <p className="text-slate-300 text-sm mt-1">
                    {publicacionDetalle.autorNombre || 'Anónimo'} &middot; {tiempoRelativo(publicacionDetalle.creadoEn)}
                  </p>
                </div>
                <button onClick={() => setPublicacionDetalle(null)} className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
                  <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Body */}
            <div className="p-6 space-y-4">
              {publicacionDetalle.fotoUrl && (
                <img src={publicacionDetalle.fotoUrl} alt={publicacionDetalle.titulo} className="w-full h-60 object-cover rounded-xl" />
              )}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faAlignLeft} className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contenido</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{publicacionDetalle.contenido}</p>
                </div>
              </div>
              {publicacionDetalle.infoContacto && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={faPhone} className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contacto</p>
                    <p className="text-sm font-semibold text-gray-800">{publicacionDetalle.infoContacto}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setPublicacionDetalle(null)}
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

export default TablonAnuncios;

