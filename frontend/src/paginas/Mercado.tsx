import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faTrash, faXmark, faUpload, faImage, faPhone, faAlignLeft, faFont,
  faSpinner, faRotateRight, faTag, faShoppingBag, faCheckCircle, faBox,
  faBone, faBriefcase, faShirt, faCompactDisc, faPills, faCoins, faStore, faUser, faGrip, faPenToSquare
} from '@fortawesome/free-solid-svg-icons';
import { useUserStore } from '../estado/estadoUsuario';
import { useUiStore } from '../estado/estadoUi';
import {
  fetchAnuncios, crearAnuncio, actualizarAnuncio, actualizarEstadoAnuncio, eliminarAnuncio,
  type AnuncioMercado, type NuevoAnuncio, type CategoriaMercado, type EstadoMercado
} from '../servicios/servicioMercado';
import clienteApi from '../servicios/clienteApi';

// ── Constantes ─────────────────────────────────────────────────────────────────

const CATEGORIAS: { valor: CategoriaMercado; label: string; icon: any }[] = [
  { valor: 'COMIDA',     label: 'Alimentación', icon: faBone },
  { valor: 'ACCESORIOS', label: 'Accesorios',   icon: faBriefcase },
  { valor: 'ROPA',       label: 'Ropa',          icon: faShirt },
  { valor: 'JUGUETES',   label: 'Juguetes',      icon: faCompactDisc },
  { valor: 'SALUD',      label: 'Salud',         icon: faPills },
  { valor: 'OTRO',       label: 'Otros',         icon: faBox },
];

const CATEGORIA_MAP = Object.fromEntries(
  CATEGORIAS.map(c => [c.valor, c])
) as Record<CategoriaMercado, typeof CATEGORIAS[0]>;

// ── Utilidades ─────────────────────────────────────────────────────────────────

const formatPrecio = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);

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

// ── Tarjeta de producto ────────────────────────────────────────────────────────

interface TarjetaProps {
  anuncio: AnuncioMercado;
  usuarioId?: number;
  esAdmin: boolean;
  onEliminar: (id: number, titulo: string) => void;
  onToggleEstado: (id: number, estado: EstadoMercado) => void;
  onVerDetalle: (anuncio: AnuncioMercado) => void;
  onEditar: (anuncio: AnuncioMercado) => void;
}

const TarjetaProducto = ({ anuncio, usuarioId, esAdmin, onEliminar, onToggleEstado, onVerDetalle, onEditar }: TarjetaProps) => {
  const esAutor = anuncio.autorId === usuarioId;
  const puedeGestionar = esAdmin || esAutor;
  const cat = CATEGORIA_MAP[anuncio.categoria];
  const disponible = anuncio.estado === 'DISPONIBLE';

  return (
    <article
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col group cursor-pointer"
      onClick={() => onVerDetalle(anuncio)}
    >
      {/* Imagen */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {anuncio.fotoUrl ? (
          <img
            src={anuncio.fotoUrl}
            alt={anuncio.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <FontAwesomeIcon icon={faBox} className="w-12 h-12 mb-2" />
            <span className="text-xs font-medium">Sin foto</span>
          </div>
        )}

        {/* Badge estado */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm ${
            disponible
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-500 text-white'
          }`}>
            {disponible ? <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" /> : <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />}
            {disponible ? 'Disponible' : 'Vendido'}
          </span>
        </div>

        {/* Badge categoría */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 text-gray-700 shadow-sm">
            {cat && <FontAwesomeIcon icon={cat.icon} className="w-3.5 h-3.5" />} {cat?.label}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 line-clamp-2">{anuncio.titulo}</h3>

        {anuncio.descripcion && (
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-2">{anuncio.descripcion}</p>
        )}

        {/* Precio */}
        <div className="mt-auto">
          <p className="text-2xl font-black text-forest-green tracking-tight">
            {formatPrecio(anuncio.precio)}
          </p>

          {/* Autor + tiempo */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
            <span className="font-medium truncate max-w-[120px]">{anuncio.autorNombre || 'Anónimo'}</span>
            <span>{tiempoRelativo(anuncio.creadoEn)}</span>
          </div>

          {/* Contacto */}
          {anuncio.infoContacto && (
            <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
              <FontAwesomeIcon icon={faPhone} className="w-3 h-3 shrink-0" />
              <span className="truncate">{anuncio.infoContacto}</span>
            </p>
          )}

          {/* Acciones del autor/admin */}
          {puedeGestionar && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              {esAutor && (
                <button
                  onClick={(ev) => { ev.stopPropagation(); onToggleEstado(anuncio.id, disponible ? 'VENDIDO' : 'DISPONIBLE'); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    disponible
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {disponible ? 'Marcar vendido' : 'Marcar disponible'}
                </button>
              )}
              {esAutor && (
                <button
                  onClick={(ev) => { ev.stopPropagation(); onEditar(anuncio); }}
                  className="p-1.5 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  title="Editar anuncio"
                >
                  <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={(ev) => { ev.stopPropagation(); onEliminar(anuncio.id, anuncio.titulo); }}
                className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Eliminar anuncio"
              >
                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

// ── Modal de publicación ───────────────────────────────────────────────────────

interface ModalPublicarProps {
  anuncioEditar?: AnuncioMercado | null;
  onClose: () => void;
  onPublicado: () => void;
}

const ModalPublicar = ({ anuncioEditar, onClose, onPublicado }: ModalPublicarProps) => {
  const { addToast } = useUiStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<NuevoAnuncio>({
    titulo: anuncioEditar?.titulo || '',
    precio: anuncioEditar?.precio || 0,
    descripcion: anuncioEditar?.descripcion || '',
    fotoUrl: anuncioEditar?.fotoUrl || '',
    categoria: anuncioEditar?.categoria || 'ACCESORIOS',
    infoContacto: anuncioEditar?.infoContacto || '',
  });
  const [previewFoto, setPreviewFoto] = useState<string | null>(anuncioEditar?.fotoUrl || null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const set = (campo: keyof NuevoAnuncio, valor: string | number) =>
    setForm(prev => ({ ...prev, [campo]: valor }));

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoFoto(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await clienteApi.post<{ url: string }>('/fotos/subir', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(prev => ({ ...prev, fotoUrl: res.data.url }));
      setPreviewFoto(res.data.url);
    } catch {
      addToast('No se pudo subir la imagen.', 'error');
    } finally {
      setSubiendoFoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) { addToast('El título es obligatorio.', 'error'); return; }
    if (!form.precio || form.precio <= 0) { addToast('El precio debe ser mayor que cero.', 'error'); return; }
    if (!form.infoContacto?.trim()) { addToast('El contacto (email o teléfono) es obligatorio.', 'error'); return; }

    setEnviando(true);
    try {
      if (anuncioEditar) {
        await actualizarAnuncio(anuncioEditar.id, form);
        addToast('¡Producto actualizado correctamente!', 'success');
      } else {
        await crearAnuncio(form);
        addToast('¡Producto publicado correctamente!', 'success');
      }
      onPublicado();
    } catch {
      addToast(anuncioEditar ? 'No se pudo actualizar el producto.' : 'No se pudo publicar el producto.', 'error');
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
            <FontAwesomeIcon icon={faShoppingBag} className="w-5 h-5 text-gray-400" />
            {anuncioEditar ? 'Editar producto' : 'Publicar producto'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Categoría */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faTag} className="w-3.5 h-3.5" /> Categoría *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIAS.map(cat => (
                <button
                  key={cat.valor}
                  type="button"
                  onClick={() => set('categoria', cat.valor)}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border-2 text-xs font-bold transition-all ${
                    form.categoria === cat.valor
                      ? 'border-forest-green bg-green-50 text-gray-400 shadow-sm'
                      : 'border-gray-100 text-gray-400 hover:border-gray-100'
                  }`}
                >
                  <span className="text-lg">{cat && <FontAwesomeIcon icon={cat.icon} className="w-6 h-6 mb-1" />}</span>
                  {cat.label}
                </button>
              ))}
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
              onChange={e => set('titulo', e.target.value)}
              placeholder="Ej: Arnés talla M casi nuevo..."
              maxLength={120}
              className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
            />
          </div>

          {/* Precio */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faCoins} className="w-3.5 h-3.5" /> Precio (€) *
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.precio || ''}
              onChange={e => set('precio', parseFloat(e.target.value) || 0)}
              placeholder="15.00"
              className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faAlignLeft} className="w-3.5 h-3.5" /> Descripción
            </label>
            <textarea
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              placeholder="Estado, talla, motivo de venta..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent resize-none"
            />
          </div>

          {/* Contacto */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faPhone} className="w-3.5 h-3.5" /> Contacto — email o teléfono *
            </label>
            <input
              type="text"
              required
              value={form.infoContacto ?? ''}
              onChange={e => set('infoContacto', e.target.value)}
              placeholder="Ej: 612 345 678 o nombre@email.com"
              className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green focus:border-transparent"
            />
          </div>

          {/* Foto */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faImage} className="w-3.5 h-3.5" /> Foto del producto (opcional)
            </label>
            {previewFoto ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-100">
                <img src={previewFoto} alt="Preview" className="w-full h-32 object-cover" />
                <button
                  type="button"
                  onClick={() => { setPreviewFoto(null); set('fotoUrl', ''); }}
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
                {subiendoFoto ? <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 animate-spin" /> : <FontAwesomeIcon icon={faUpload} className="w-6 h-6" />}
                <span className="text-xs font-semibold">
                  {subiendoFoto ? 'Subiendo imagen...' : 'Subir foto (JPG/PNG, máx. 5MB)'}
                </span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFoto} />
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
              {anuncioEditar ? 'Guardar cambios' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Skeleton ───────────────────────────────────────────────────────────────────

const SkeletonTarjeta = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-100" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-100 rounded-lg w-3/4" />
      <div className="h-3 bg-gray-100 rounded-lg w-full" />
      <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
      <div className="h-7 bg-gray-100 rounded-lg w-1/3 mt-2" />
    </div>
  </div>
);

// ── Página principal ───────────────────────────────────────────────────────────

const FILTROS_ESTADO: { label: React.ReactNode; valor: EstadoMercado | null }[] = [
  { label: <><FontAwesomeIcon icon={faGrip} className="w-3.5 h-3.5 inline mr-1" /> Todos</>, valor: null },
  { label: <><FontAwesomeIcon icon={faCheckCircle} className="w-3.5 h-3.5 inline mr-1" /> Disponible</>, valor: 'DISPONIBLE' },
  { label: <><FontAwesomeIcon icon={faTag} className="w-3.5 h-3.5 inline mr-1" /> Vendido</>, valor: 'VENDIDO' },
];

const Mercado = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUserStore();
  const { addToast } = useUiStore();

  const [anuncios, setAnuncios] = useState<AnuncioMercado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroCat, setFiltroCat] = useState<CategoriaMercado | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<EstadoMercado | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [vistaPropia, setVistaPropia] = useState(false);
  const [anuncioDetalle, setAnuncioDetalle] = useState<AnuncioMercado | null>(null);
  const [anuncioEditar, setAnuncioEditar] = useState<AnuncioMercado | null>(null);

  const esAdmin = user?.role === 'ROL_ADMIN';

  const cargar = async () => {
    setCargando(true);
    try {
      const estado = vistaPropia ? filtroEstado : 'DISPONIBLE';
      const data = await fetchAnuncios(filtroCat, estado);
      setAnuncios(data);
    } catch {
      addToast('Error al cargar los productos.', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, [filtroCat, filtroEstado, vistaPropia]);

  const handlePublicar = () => {
    if (!isAuthenticated) { navigate('/iniciar-sesion'); return; }
    setAnuncioEditar(null);
    setModalAbierto(true);
  };

  const handleEditar = (anuncio: AnuncioMercado) => {
    setAnuncioEditar(anuncio);
    setModalAbierto(true);
  };

  const handleEliminar = async (id: number, titulo: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${titulo}"?`)) return;
    try {
      await eliminarAnuncio(id);
      addToast('Producto eliminado.', 'success');
      cargar();
    } catch {
      addToast('No se pudo eliminar el producto.', 'error');
    }
  };

  const handleToggleEstado = async (id: number, nuevoEstado: EstadoMercado) => {
    try {
      await actualizarEstadoAnuncio(id, nuevoEstado);
      addToast(`Producto marcado como ${nuevoEstado === 'VENDIDO' ? 'vendido' : 'disponible'}.`, 'success');
      cargar();
    } catch {
      addToast('No se pudo actualizar el estado.', 'error');
    }
  };

  const anunciosFiltrados = vistaPropia
    ? anuncios.filter(a => a.autorId === user?.id)
    : anuncios;

  return (
    <div className="h-full w-full overflow-y-auto bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b-4 border-forest-green/30">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-2xl bg-forest-green flex items-center justify-center mr-4 shadow-md border border-forest-green/30">
                  <FontAwesomeIcon icon={faStore} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-gray-900">Tienda Canina</h1>
                  <p className="text-gray-500 text-sm font-medium">
                    Compra y vende artículos para tu perro con la comunidad de A Coruña
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <button
                  onClick={() => setVistaPropia(!vistaPropia)}
                  className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all border ${
                    vistaPropia
                      ? 'bg-forest-green text-white border-forest-green shadow-sm'
                      : 'bg-gray-100 text-gray-700 border-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <FontAwesomeIcon icon={faUser} className="w-4 h-4 inline mr-1" /> Mis anuncios
                </button>
              )}
              <button
                onClick={handlePublicar}
                className="inline-flex items-center gap-2 bg-forest-green text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:bg-green-700 active:scale-95 transition-all text-sm"
              >
                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                Publicar producto
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide relative items-center justify-center">
          {/* Filtros de categoría */}
          <button
            onClick={() => setFiltroCat(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all shrink-0 ${
              filtroCat === null
                ? 'bg-forest-green text-white border-forest-green shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-forest-green hover:text-forest-green'
            }`}
          >
            <span><FontAwesomeIcon icon={faGrip} className="w-3.5 h-3.5" /></span>
            Todos
          </button>
          {CATEGORIAS.map(cat => {
            const activo = filtroCat === cat.valor;
            return (
              <button
                key={cat.valor}
                onClick={() => setFiltroCat(activo ? null : cat.valor)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all shrink-0 ${
                  activo
                    ? 'bg-forest-green text-white border-forest-green shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-forest-green hover:text-forest-green'
                }`}
              >
                <span><FontAwesomeIcon icon={cat.icon} className="w-3.5 h-3.5" /></span>
                {cat.label}
              </button>
            )
          })}

          <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />

          {/* Filtro de estado (solo en Mis anuncios) */}
          {vistaPropia && FILTROS_ESTADO.map(f => {
            const activo = filtroEstado === f.valor;
            return (
              <button
                key={String(f.valor)}
                onClick={() => setFiltroEstado(f.valor)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all shrink-0 ${
                  activo
                    ? 'bg-gray-800 text-white border-gray-800 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-800 hover:text-gray-800'
                }`}
              >
                {f.label}
              </button>
            )
          })}

          <button
            onClick={cargar}
            disabled={cargando}
            title="Recargar"
            className="absolute right-6 shrink-0 p-2 rounded-full border border-gray-100 text-forest-green hover:bg-green-50 transition-colors bg-white shadow-sm"
          >
            <FontAwesomeIcon icon={faRotateRight} className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {vistaPropia && isAuthenticated && (
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm font-bold text-gray-700 flex items-center gap-1"><FontAwesomeIcon icon={faUser} className="w-4 h-4 inline" /> Mis anuncios</span>
            <button
              onClick={() => setVistaPropia(false)}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Ver todos
            </button>
          </div>
        )}

        {cargando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <SkeletonTarjeta key={i} />)}
          </div>
        ) : anunciosFiltrados.length === 0 ? (
          <div className="text-center py-20">
            <FontAwesomeIcon icon={faStore} className="w-16 h-16 text-forest-green mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-1">No hay productos</h3>
            <p className="text-sm text-gray-400 mb-6">
              {vistaPropia
                ? 'Aún no has publicado ningún producto.'
                : 'Sé el primero en publicar algo en la tienda.'}
            </p>
            <button
              onClick={handlePublicar}
              className="inline-flex items-center gap-2 bg-forest-green text-white font-bold px-6 py-3 rounded-2xl shadow-md hover:bg-green-700 transition-all text-sm"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              Publicar producto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {anunciosFiltrados.map(a => (
              <TarjetaProducto
                key={a.id}
                anuncio={a}
                usuarioId={user?.id}
                esAdmin={esAdmin}
                onEliminar={handleEliminar}
                onToggleEstado={handleToggleEstado}
                onVerDetalle={setAnuncioDetalle}
                onEditar={handleEditar}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal publicar / editar */}
      {modalAbierto && (
        <ModalPublicar
          anuncioEditar={anuncioEditar}
          onClose={() => { setModalAbierto(false); setAnuncioEditar(null); }}
          onPublicado={() => { setModalAbierto(false); setAnuncioEditar(null); cargar(); }}
        />
      )}

      {/* Modal detalle producto */}
      {anuncioDetalle && (() => {
        const cat = CATEGORIA_MAP[anuncioDetalle.categoria];
        const disponible = anuncioDetalle.estado === 'DISPONIBLE';
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAnuncioDetalle(null)} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {anuncioDetalle.fotoUrl && (
                <img src={anuncioDetalle.fotoUrl} alt={anuncioDetalle.titulo} className="w-full h-52 object-cover" />
              )}
              <div className="bg-gradient-to-r from-teal-600 to-cyan-700 px-6 py-5 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold mb-2 ${
                      disponible ? 'bg-emerald-400/30 text-emerald-100' : 'bg-gray-400/30 text-gray-200'
                    }`}>
                      {disponible ? 'Disponible' : 'Vendido'}
                    </span>
                    <h2 className="text-xl font-black leading-tight">{anuncioDetalle.titulo}</h2>
                    <p className="text-4xl font-black mt-2">{formatPrecio(anuncioDetalle.precio)}</p>
                  </div>
                  <button onClick={() => setAnuncioDetalle(null)} className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
                    <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  {cat && <FontAwesomeIcon icon={cat.icon} className="w-4 h-4 text-teal-600" />}
                  <span className="text-sm font-bold text-teal-600">{cat?.label}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-xs text-gray-400">{anuncioDetalle.autorNombre || 'Anónimo'}</span>
                </div>
                {anuncioDetalle.descripcion && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faAlignLeft} className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descripción</p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{anuncioDetalle.descripcion}</p>
                    </div>
                  </div>
                )}
                {anuncioDetalle.infoContacto && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faPhone} className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contacto</p>
                      <p className="text-sm font-bold text-gray-800">{anuncioDetalle.infoContacto}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-6 pb-6">
                <button
                  onClick={() => setAnuncioDetalle(null)}
                  className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Mercado;
