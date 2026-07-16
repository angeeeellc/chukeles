import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faFloppyDisk, faUpload, faImage, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { fetchPlaceById, crearLugarApi, editarLugarApi } from '../../services/servicioLugar';
import { subirFotoLugar } from '../../services/servicioFotos';
import ComponenteMapaAdmin from '../../components/ComponenteMapaAdmin';
import { useUiStore } from '../../store/storeUi';

interface FormularioLugarProps {
  lugarId: number | null;
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

const FormularioLugar = ({ lugarId, onClose, onSave }: FormularioLugarProps) => {
  const { addToast } = useUiStore();
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  // Estados del formulario de texto
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('OTRO');
  const [direccion, setDireccion] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [sitioWeb, setSitioWeb] = useState('');
  const [aprobado, setAprobado] = useState(true);

  // Estados de foto
  const [fotoUrlActual, setFotoUrlActual] = useState<string | null>(null);   // URL ya guardada en BD
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null); // Nuevo archivo pendiente
  const [previsualizacion, setPrevisualizacion] = useState<string | null>(null);     // ObjectURL local

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    if (lugarId) {
      const cargarLugar = async () => {
        setCargandoDatos(true);
        try {
          const lugar = await fetchPlaceById(lugarId);
          setNombre(lugar.nombre);
          setCategoria(lugar.categoria);
          setDireccion(lugar.direccion);
          setLat(lugar.lat);
          setLng(lugar.lng);
          setDescripcion(lugar.descripcion);
          setTelefono(lugar.telefono || '');
          setSitioWeb(lugar.sitioWeb || '');
          setFotoUrlActual(lugar.fotoUrl || null);
          setAprobado((lugar as any).aprobado !== false);
        } catch (err) {
          addToast('Error al cargar la información del lugar.', 'error');
          onClose();
        } finally {
          setCargandoDatos(false);
        }
      };
      cargarLugar();
    } else {
      // Valores por defecto para nueva creación
      setNombre('');
      setCategoria('OTHER');
      setDireccion('');
      setLat(43.3623);
      setLng(-8.4115);
      setDescripcion('');
      setTelefono('');
      setSitioWeb('');
      setFotoUrlActual(null);
      setArchivoSeleccionado(null);
      setPrevisualizacion(null);
      setAprobado(true);
    }
  }, [lugarId, onClose, addToast]);

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

    // Validaciones en cliente (duplicadas en servidor)
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

    // Liberar ObjectURL anterior si existía
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
      // Si no hay archivo nuevo, conservar la foto actual (o dejar en blanco)
      fotoUrl: fotoUrlActual || undefined,
      aprobado
    };

    try {
      let idLugar: number;

      if (lugarId) {
        const actualizado = await editarLugarApi(lugarId, datos);
        idLugar = (actualizado as any).id ?? lugarId;
        addToast('Datos del lugar actualizados.', 'success');
      } else {
        const creado = await crearLugarApi(datos);
        idLugar = (creado as any).id;
        addToast('Lugar creado correctamente.', 'success');
      }

      // Si hay un archivo nuevo, subirlo
      if (archivoSeleccionado && idLugar) {
        setSubiendoFoto(true);
        try {
          const respuesta = await subirFotoLugar(idLugar, archivoSeleccionado);
          setFotoUrlActual(respuesta.fotoUrl);
          addToast('Foto subida correctamente.', 'success');
        } catch (err: any) {
          const mensaje = err?.response?.data?.message || 'No se pudo subir la foto.';
          addToast(mensaje, 'error');
          // No cerramos el modal: el lugar ya fue creado/editado, solo falló la foto
          setCargando(false);
          setSubiendoFoto(false);
          return;
        } finally {
          setSubiendoFoto(false);
        }
      }

      onSave();
    } catch (err) {
      addToast('Error al guardar el lugar. Revisa los datos.', 'error');
    } finally {
      setCargando(false);
    }
  };

  if (cargandoDatos) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl">
          <span className="w-10 h-10 border-4 border-forest-green/20 border-t-forest-green rounded-full animate-spin inline-block mb-4" />
          <p className="text-gray-600 font-semibold">Cargando datos del lugar...</p>
        </div>
      </div>
    );
  }

  // Imagen a mostrar: previsualización local > foto ya guardada > null
  const imagenMostrada = previsualizacion || fotoUrlActual;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-black text-gray-900">
              {lugarId ? 'Editar Lugar Pet-Friendly' : 'Añadir Nuevo Lugar Pet-Friendly'}
            </h2>
            <p className="text-xs text-gray-500 font-medium">Completa la ficha y ubícalo en el mapa</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            aria-label="Cerrar modal"
          >
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column Fields */}
            <div className="flex flex-col gap-4">
              {/* Nombre */}
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

              {/* Categoría */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-green"
                >
                  {CATEGORIAS.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dirección */}
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

              {/* Teléfono & Sitio Web */}
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

              {/* ── Foto — input de archivo con previsualización ── */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Foto del lugar
                </label>

                {/* Previsualización */}
                <div className="relative w-full h-40 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center group">
                  {imagenMostrada ? (
                    <>
                      <img
                        src={imagenMostrada}
                        alt="Previsualización"
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay con spinner durante upload */}
                      {subiendoFoto && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-white animate-spin" />
                        </div>
                      )}
                      {/* Botón quitar foto */}
                      {!subiendoFoto && (
                        <button
                          type="button"
                          onClick={handleQuitarFoto}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          title="Quitar foto"
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

                {/* Input de archivo oculto + botón personalizado */}
                <input
                  ref={inputArchivoRef}
                  type="file"
                  id="foto-lugar-input"
                  accept="image/jpeg,image/png"
                  onChange={handleSeleccionarArchivo}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => inputArchivoRef.current?.click()}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 font-semibold hover:bg-gray-50 hover:border-forest-green hover:text-forest-green transition-all"
                >
                  <FontAwesomeIcon icon={faUpload} className="w-4 h-4" />
                  {archivoSeleccionado
                    ? `Cambiar foto · ${archivoSeleccionado.name}`
                    : 'Seleccionar foto (JPG / PNG · máx. 5 MB)'}
                </button>
              </div>
            </div>

            {/* Right Column — Coordenadas y mapa */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Ubicación exacta en mapa <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <span className="text-[10px] text-gray-500 font-semibold uppercase">Latitud</span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={lat || ''}
                      onChange={(e) => setLat(parseFloat(e.target.value) || null)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-forest-green"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-semibold uppercase">Longitud</span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={lng || ''}
                      onChange={(e) => setLng(parseFloat(e.target.value) || null)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-forest-green"
                    />
                  </div>
                </div>
                {/* Mapa Interactivo */}
                <ComponenteMapaAdmin
                  lat={lat}
                  lng={lng}
                  onSelectCoordinates={handleSelectCoordinates}
                />
              </div>
            </div>
          </div>

          {/* Descripción completa */}
          <div className="flex flex-col gap-1">
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

          {/* Aprobado checkbox */}
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <input
              type="checkbox"
              id="lugar-aprobado"
              checked={aprobado}
              onChange={(e) => setAprobado(e.target.checked)}
              className="w-4 h-4 text-forest-green bg-white border-gray-300 rounded focus:ring-forest-green cursor-pointer"
            />
            <label htmlFor="lugar-aprobado" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
              Aprobar lugar inmediatamente para publicación pública
            </label>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
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
              <FontAwesomeIcon icon={faFloppyDisk} className="w-4 h-4" />
            )}
            {subiendoFoto ? 'Subiendo foto...' : cargando ? 'Guardando...' : lugarId ? 'Guardar Cambios' : 'Crear Lugar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormularioLugar;
