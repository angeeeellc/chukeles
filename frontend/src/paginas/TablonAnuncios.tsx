import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircleQuestion, Info, Plus, Trash2,
  X, Upload, ImageIcon, Phone, AlignLeft, Type,
  Loader2, RefreshCw
} from 'lucide-react';
import { useUserStore } from '../estado/estadoUsuario';
import { useUiStore } from '../estado/estadoUi';
import {
  fetchPublicaciones, crearPublicacion, eliminarPublicacion,
  type PublicacionTablon, type TipoPublicacion, type NuevaPublicacion
} from '../servicios/servicioTablon';
import clienteApi from '../servicios/clienteApi';

// ── Utilidades ─────────────────────────────────────────────────────────────────

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
    icon: <MessageCircleQuestion className="w-3.5 h-3.5" />,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  INFO: {
    label: 'Info',
    icon: <Info className="w-3.5 h-3.5" />,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
};

// ── Badge de tipo ──────────────────────────────────────────────────────────────

const BadgeTipo = ({ tipo }: { tipo: TipoPublicacion }) => {
  const cfg = TIPO_CONFIG[tipo];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

// ── Tarjeta de anuncio ─────────────────────────────────────────────────────────

interface TarjetaProps {
  pub: PublicacionTablon;
  usuarioId?: number;
  esAdmin: boolean;
  onEliminar: (id: number, titulo: string) => void;
}

const TarjetaAnuncio = ({ pub, usuarioId, esAdmin, onEliminar }: TarjetaProps) => {
  const puedeEliminar = esAdmin || pub.autorId === usuarioId;

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
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

        {/* Contenido */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{pub.contenido}</p>

        {/* Footer: autor + contacto + acción */}
        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {pub.autorNombre && (
              <p className="text-xs font-semibold text-gray-700 truncate">
                {pub.autorNombre}
              </p>
            )}
            {pub.infoContacto && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                <Phone className="w-3 h-3 shrink-0" />
                {pub.infoContacto}
              </p>
            )}
          </div>

          {puedeEliminar && (
            <button
              onClick={() => onEliminar(pub.id, pub.titulo)}
              title="Eliminar publicación"
              className="shrink-0 p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

// ── Modal de nueva publicación ─────────────────────────────────────────────────

interface ModalPublicarProps {
  onClose: () => void;
  onPublicado: () => void;
}

const ModalPublicar = ({ onClose, onPublicado }: ModalPublicarProps) => {
  const { addToast } = useUiStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<NuevaPublicacion>({
    titulo: '',
    contenido: '',
    tipo: 'INFO',
    fotoUrl: '',
    infoContacto: '',
  });
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
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
      const datos: NuevaPublicacion = {
        ...form,
      };
      await crearPublicacion(datos);
      addToast('¡Anuncio publicado correctamente!', 'success');
      onPublicado();
    } catch {
      addToast('No se pudo publicar el anuncio. Inténtalo de nuevo.', 'error');
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
          <h2 className="text-lg font-black text-gray-900">Publicar anuncio</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
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
                        : 'border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <span className={activo ? cfg.text : 'text-gray-300'}>{cfg.icon}</span>
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" /> Título *
            </label>
            <input
              type="text"
              value={form.titulo}
              onChange={e => handleCampoTexto('titulo', e.target.value)}
              placeholder="Ej: Busco veterinario para gato de 10 años..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
              maxLength={120}
            />
          </div>

          {/* Contenido */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5" /> Descripción *
            </label>
            <textarea
              value={form.contenido}
              onChange={e => handleCampoTexto('contenido', e.target.value)}
              placeholder="Explica tu anuncio con detalle..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent resize-none"
            />
          </div>

          {/* Info de contacto */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Contacto (opcional)
            </label>
            <input
              type="text"
              value={form.infoContacto ?? ''}
              onChange={e => handleCampoTexto('infoContacto', e.target.value)}
              placeholder="Teléfono, email o Instagram..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
            />
          </div>

          {/* Foto */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Foto (opcional)
            </label>
            {previewFoto ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img src={previewFoto} alt="Preview" className="w-full h-24 object-cover" />
                <button
                  type="button"
                  onClick={() => { setPreviewFoto(null); setForm(prev => ({ ...prev, fotoUrl: '' })); }}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={subiendoFoto}
                className="w-full flex flex-col items-center gap-1.5 py-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-forest-green text-gray-400 hover:text-forest-green transition-colors"
              >
                {subiendoFoto
                  ? <Loader2 className="w-6 h-6 animate-spin" />
                  : <Upload className="w-6 h-6" />
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
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
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
              {enviando && <Loader2 className="w-4 h-4 animate-spin" />}
              Publicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Página principal ───────────────────────────────────────────────────────────

const FILTROS: { label: string; valor: TipoPublicacion | null }[] = [
  { label: '🐾 Todos', valor: null },
  { label: '🤔 Dudas', valor: 'DUDA' },
  { label: 'ℹ️ Info', valor: 'INFO' },
];

const TablonAnuncios = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUserStore();
  const { addToast } = useUiStore();

  const [publicaciones, setPublicaciones] = useState<PublicacionTablon[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<TipoPublicacion | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  const handlePublicar = () => {
    if (!isAuthenticated) {
      navigate('/iniciar-sesion');
      return;
    }
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

  return (
    <div className="h-full w-full overflow-y-auto bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-forest-green via-green-700 to-emerald-800 text-white">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-black tracking-tight mb-1">📋 Anuncios</h1>
          <p className="text-green-100 text-sm">
            La comunidad perruna de A Coruña — comparte dudas e información de la comunidad
          </p>

          <button
            onClick={handlePublicar}
            className="mt-6 inline-flex items-center gap-2 bg-white text-forest-green
                       font-bold px-6 py-3 rounded-2xl shadow-lg hover:bg-gray-50
                       active:scale-95 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Publicar anuncio
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {FILTROS.map(f => (
            <button
              key={String(f.valor)}
              onClick={() => setFiltro(f.valor)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                filtro === f.valor
                  ? 'bg-forest-green text-white border-forest-green shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}

          <button
            onClick={cargar}
            disabled={cargando}
            title="Recargar"
            className="ml-auto shrink-0 p-2 rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {cargando ? (
          // Skeleton loader
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        ) : publicaciones.length === 0 ? (
          // Estado vacío
          <div className="text-center py-20">
            <div className="text-6xl mb-4">
              {filtro === 'DUDA' ? '🤔' : filtro === 'INFO' ? 'ℹ️' : '📋'}
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">
              {filtro ? `No hay anuncios de tipo "${TIPO_CONFIG[filtro].label}"` : 'No hay anuncios'}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              {isAuthenticated ? '¡Sé el primero en publicar!' : 'Inicia sesión para publicar.'}
            </p>
            <button
              onClick={handlePublicar}
              className="inline-flex items-center gap-2 bg-forest-green text-white font-bold
                         px-6 py-3 rounded-2xl shadow-md hover:bg-green-700 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              Publicar anuncio
            </button>
          </div>
        ) : (
          // Grid de tarjetas
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicaciones.map(pub => (
              <TarjetaAnuncio
                key={pub.id}
                pub={pub}
                usuarioId={user?.id}
                esAdmin={esAdmin}
                onEliminar={handleEliminar}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAbierto && (
        <ModalPublicar
          onClose={() => setModalAbierto(false)}
          onPublicado={() => { setModalAbierto(false); cargar(); }}
        />
      )}
    </div>
  );
};

export default TablonAnuncios;

