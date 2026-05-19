import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { fetchPlaceById, crearLugarApi, editarLugarApi } from '../../servicios/servicioLugar';
import ComponenteMapaAdmin from '../../componentes/ComponenteMapaAdmin';
import { useUiStore } from '../../estado/estadoUi';

interface FormularioLugarProps {
  lugarId: number | null;
  onClose: () => void;
  onSave: () => void;
}

const CATEGORIAS = [
  { value: 'VET', label: '🏥 Veterinario' },
  { value: 'PARK', label: '🌳 Parque' },
  { value: 'GROOMING', label: '✂️ Peluquería' },
  { value: 'STORE', label: '🛍️ Tienda' },
  { value: 'HOTEL', label: '🏨 Hotel' },
  { value: 'TRAINING', label: '🐕 Adiestramiento' },
  { value: 'OTHER', label: '📍 Otro' }
];

const FormularioLugar = ({ lugarId, onClose, onSave }: FormularioLugarProps) => {
  const { addToast } = useUiStore();
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(false);

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('OTHER');
  const [direccion, setDireccion] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [sitioWeb, setSitioWeb] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [aprobado, setAprobado] = useState(true);

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
          setFotoUrl(lugar.fotoUrl || '');
          // En los modelos en español, aprobado puede ser null o boolean
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
      setLat(43.3623); // Coordenadas del centro de A Coruña por defecto
      setLng(-8.4115);
      setDescripcion('');
      setTelefono('');
      setSitioWeb('');
      setFotoUrl('');
      setAprobado(true);
    }
  }, [lugarId, onClose, addToast]);

  const handleSelectCoordinates = (selectedLat: number, selectedLng: number) => {
    setLat(parseFloat(selectedLat.toFixed(6)));
    setLng(parseFloat(selectedLng.toFixed(6)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      fotoUrl: fotoUrl || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800',
      aprobado
    };

    try {
      if (lugarId) {
        await editarLugarApi(lugarId, datos);
        addToast('Lugar actualizado correctamente. 🐾', 'success');
      } else {
        await crearLugarApi(datos);
        addToast('Lugar creado correctamente. 🎉', 'success');
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
            <X className="w-5 h-5" />
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

              {/* Foto URL */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  URL de la Foto
                </label>
                <input
                  type="url"
                  value={fotoUrl}
                  onChange={(e) => setFotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-green"
                />
              </div>
            </div>

            {/* Right Column Coordinates and Map */}
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
            className="px-5 py-2.5 rounded-xl text-gray-700 font-semibold text-sm border border-gray-200 hover:bg-gray-100 active:scale-98 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={cargando}
            className="flex items-center gap-2 bg-forest-green text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-green-700 active:scale-98 transition-all disabled:opacity-60"
          >
            {cargando ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {lugarId ? 'Guardar Cambios' : 'Crear Lugar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormularioLugar;
