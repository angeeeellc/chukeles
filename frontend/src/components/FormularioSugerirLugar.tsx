import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPaperPlane, faUpload, faImage, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { crearLugarApi } from '../services/servicioLugar';
import { subirFotoLugar } from '../services/servicioFotos';
import ComponenteMapaAdmin from './ComponenteMapaAdmin';
import { useUiStore } from '../store/storeUi';

interface FormularioSugerirLugarProps {
  onClose: () => void;
  onSave: () => void;
}

const CATEGORIAS = [
  { value: 'VETERINARIO',    label: 'Veterinario' },
  { value: 'PARQUE',         label: 'Parque' },
  { value: 'PELUQUERIA',     label: 'Peluquería' },
  { value: 'TIENDA',         label: 'Tienda' },
  { value: 'HOTEL',          label: 'Hotel' },
  { value: 'ADIESTRAMIENTO', label: 'Adiestramiento' },
  { value: 'PET_FRIENDLY',   label: 'Pet Friendly' },
  { value: 'OTRO',           label: 'Otro' }
];

const TAMANO_MAXIMO_MB = 5;
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png'];

const FormularioSugerirLugar = ({ onClose, onSave }: FormularioSugerirLugarProps) => {
  const { addToast } = useUiStore();
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  const [cargando, setCargando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  // Estados del formulario de texto
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('OTRO');
  const [direccion, setDireccion] = useState('');
  const [lat, setLat] = useState<number | null>(43.3623);
  const [lng, setLng] = useState<number | null>(-8.4115);
  const [descripcion, setDescripcion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [sitioWeb, setSitioWeb] = useState('');

  // Estados de foto
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [previsualizacion, setPrevisualizacion] = useState<string | null>(null);

  // Liberar ObjectURL al desmontar o al cambiar archivo
  useEffect(() => {
    return () => {
      if (previsualizacion) URL.revokeObjectURL(previsualizacion);
    };
  }, [previsualizacion]);

  const handleSelectCoordinates = (selectedLat: number, selectedLng: number) => {
    setLat(parseFloat(selectedLat.toFixed(6)));
    setLng(parseFloat(selectedLng.toFixed(6)));
  };

  const handleSeleccionarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      addToast('Solo se permiten imágenes JPG o PNG.', 'error');
      e.target.value = '';
      return;
    }
    if (archivo.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
      addToast(`La imagen no puede superar los ${TAMANO_MAXIMO_MB} MB.`, 'error');
      e.target.value = '';
      return;
    }

    if (previsualizacion) URL.revokeObjectURL(previsualizacion);

    setArchivoSeleccionado(archivo);
    setPrevisualizacion(URL.createObjectURL(archivo));
  };

  const handleQuitarFoto = () => {
    if (previsualizacion) URL.revokeObjectURL(previsualizacion);
    setArchivoSeleccionado(null);
    setPrevisualizacion(null);
    if (inputArchivoRef.current) inputArchivoRef.current.value = '';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!nombre || !categoria || !direccion || lat === null || lng === null || !descripcion) {
      addToast('Por favor, rellena todos los campos obligatorios.', 'info');
      return;
    }

    setCargando(true);
    const datos = {
      nombre,
      categoria,
      direccion,
      lat,
      lng,
      descripcion,
      telefono: telefono || undefined,
      sitioWeb: sitioWeb || undefined,
      aprobado: false // Siempre falso por seguridad
    };

    try {
      const creado = await crearLugarApi(datos);
      const idLugar = (creado as any).id;
      
      if (archivoSeleccionado && idLugar) {
        setSubiendoFoto(true);
        try {
          await subirFotoLugar(idLugar, archivoSeleccionado);
        } catch (err: any) {
          addToast('El lugar se sugirió pero no se pudo subir la foto.', 'error');
          setCargando(false);
          setSubiendoFoto(false);
          onSave(); // Terminar de todos modos
          return;
        } finally {
          setSubiendoFoto(false);
        }
      }

      addToast('Lugar sugerido correctamente. Será revisado por un administrador.', 'success');
      onSave();
    } catch (err: any) {
      const msjError = err.response?.data?.mensaje || 'Error al sugerir el lugar. Revisa los datos.';
      addToast(msjError, 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
              Sugerir Lugar Pet-Friendly
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium">Ayúdanos a hacer crecer la comunidad recomendando un sitio.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            aria-label="Cerrar modal"
          >
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Nombre del lugar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Cafetería Amigos Perrunos"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-green appearance-none pr-10 cursor-pointer shadow-sm hover:border-gray-300 transition-colors"
                  >
                    {CATEGORIAS.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Dirección postal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej: Calle Zalaeta, 4, 15002 A Coruña"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej: 981 12 34 56"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Sitio Web
                  </label>
                  <input
                    type="url"
                    value={sitioWeb}
                    onChange={(e) => setSitioWeb(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Foto del lugar
                </label>
                <div className="relative w-full h-40 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center group">
                  {previsualizacion ? (
                    <>
                      <img src={previsualizacion} alt="Previsualización" className="w-full h-full object-cover" />
                      {subiendoFoto && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-white animate-spin" />
                        </div>
                      )}
                      {!subiendoFoto && (
                        <button
                          type="button"
                          onClick={handleQuitarFoto}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400 pointer-events-none">
                      <FontAwesomeIcon icon={faImage} className="w-8 h-8" />
                      <span className="text-xs font-medium">Sin foto</span>
                    </div>
                  )}
                </div>

                <input ref={inputArchivoRef} type="file" accept="image/jpeg,image/png" onChange={handleSeleccionarArchivo} className="hidden" />
                <button
                  type="button"
                  onClick={() => inputArchivoRef.current?.click()}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 font-semibold hover:bg-gray-50 hover:border-forest-green hover:text-forest-green transition-all"
                >
                  <FontAwesomeIcon icon={faUpload} className="w-4 h-4" />
                  {archivoSeleccionado ? `Cambiar foto · ${archivoSeleccionado.name}` : 'Seleccionar foto'}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Ubicación exacta en mapa <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <span className="text-[10px] text-gray-500 font-semibold uppercase">Latitud</span>
                    <input type="number" step="any" required value={lat || ''} onChange={(e) => setLat(parseFloat(e.target.value) || null)} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-forest-green" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-semibold uppercase">Longitud</span>
                    <input type="number" step="any" required value={lng || ''} onChange={(e) => setLng(parseFloat(e.target.value) || null)} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-forest-green" />
                  </div>
                </div>
                <ComponenteMapaAdmin lat={lat} lng={lng} onSelectCoordinates={handleSelectCoordinates} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Descripción completa <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe qué hace especial este lugar para ir con perros..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green resize-none"
            />
          </div>
        </form>

        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={cargando || subiendoFoto}
            className="px-5 py-2.5 rounded-xl text-gray-700 font-semibold text-sm border border-gray-200 hover:bg-gray-100 active:scale-98 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={cargando || subiendoFoto}
            className="flex items-center gap-2 bg-forest-green text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-green-700 active:scale-98 transition-all disabled:opacity-60"
          >
            {(cargando || subiendoFoto) ? (
              <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
            )}
            {subiendoFoto ? 'Subiendo foto...' : cargando ? 'Enviando...' : 'Sugerir Lugar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormularioSugerirLugar;
