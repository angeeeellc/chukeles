import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPlaceById, type Lugar } from '../services/servicioLugar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPhone, faGlobe, faArrowLeft, faLocationArrow, faHospital, faTree, faScissors, faStore, faBuilding, faGraduationCap, faMugHot, faPaw } from '@fortawesome/free-solid-svg-icons';

const CATEGORIA_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  VETERINARIO: { label: 'Veterinario',    icon: faHospital, color: 'bg-red-100 text-red-700' },
  VET:         { label: 'Veterinario',    icon: faHospital, color: 'bg-red-100 text-red-700' },
  PARQUE:      { label: 'Parque',         icon: faTree, color: 'bg-green-100 text-green-700' },
  PARK:        { label: 'Parque',         icon: faTree, color: 'bg-green-100 text-green-700' },
  PELUQUERIA:  { label: 'Peluquería',     icon: faScissors, color: 'bg-purple-100 text-purple-700' },
  GROOMING:    { label: 'Peluquería',     icon: faScissors, color: 'bg-purple-100 text-purple-700' },
  TIENDA:      { label: 'Tienda',         icon: faStore, color: 'bg-orange-100 text-orange-700' },
  STORE:       { label: 'Tienda',         icon: faStore, color: 'bg-orange-100 text-orange-700' },
  HOTEL:       { label: 'Hotel',          icon: faBuilding, color: 'bg-blue-100 text-blue-700' },
  ADIESTRAMIENTO: { label: 'Adiestramiento', icon: faGraduationCap, color: 'bg-yellow-100 text-yellow-700' },
  TRAINING:    { label: 'Adiestramiento', icon: faGraduationCap, color: 'bg-yellow-100 text-yellow-700' },
  PET_FRIENDLY:{ label: 'Pet Friendly',   icon: faMugHot, color: 'bg-teal-100 text-teal-700' },
  OTHER:       { label: 'Otro',           icon: faPaw, color: 'bg-gray-100 text-gray-700' },
};

const DetalleLugarSkeleton = () => (
  <div className="max-w-2xl mx-auto p-6 animate-pulse">
    <div className="h-64 bg-gray-200 rounded-3xl mb-6" />
    <div className="h-6 bg-gray-200 rounded w-2/3 mb-3" />
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-6" />
    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
    <div className="h-4 bg-gray-200 rounded w-5/6 mb-2" />
    <div className="h-4 bg-gray-200 rounded w-4/6 mb-6" />
    <div className="h-12 bg-gray-200 rounded-xl" />
  </div>
);

const DetalleLugar = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [cargando, setCargando] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setCargando(true);
    fetchPlaceById(Number(id))
      .then((data) => {
        setLugar(data);
        setCargando(false);
      })
      .catch(() => {
        setCargando(false);
      });
  }, [id]);

  if (cargando) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <DetalleLugarSkeleton />
      </div>
    );
  }

  if (!lugar) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
        <FontAwesomeIcon icon={faPaw} className="w-16 h-16 text-forest-green mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Lugar no encontrado</h2>
        <p className="text-gray-500 text-sm mb-6">El lugar que buscas no existe o ha sido eliminado.</p>
        <Link
          to="/"
          className="bg-forest-green text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-green-700 transition-all"
        >
          ← Volver al mapa
        </Link>
      </div>
    );
  }

  const cat = CATEGORIA_LABELS[lugar.categoria?.toUpperCase()] || CATEGORIA_LABELS.OTHER;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lugar.lat},${lugar.lng}`;
  const fallbackImg = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800';

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-forest-green transition-colors mb-5 group"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver
        </button>

        {/* Photo */}
        <div className="w-full h-64 rounded-3xl overflow-hidden mb-6 bg-gray-200 shadow-md">
          <img
            src={imgError ? fallbackImg : (lugar.fotoUrl || fallbackImg)}
            alt={lugar.nombre}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full mb-2 ${cat.color}`}>
              <FontAwesomeIcon icon={cat.icon} className="w-3.5 h-3.5" /> {cat.label}
            </span>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">{lugar.nombre}</h1>
          </div>
        </div>

        {/* Description */}
        {lugar.descripcion && (
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {lugar.descripcion}
          </p>
        )}

        {/* Info cards */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-start gap-3 bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm">
            <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 text-forest-green mt-0.5 shrink-0" />
            <span className="text-sm text-gray-700">{lugar.direccion}</span>
          </div>

          {lugar.telefono && (
            <a
              href={`tel:${lugar.telefono}`}
              className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm
                         hover:border-forest-green/30 hover:bg-green-50/50 transition-all"
            >
              <FontAwesomeIcon icon={faPhone} className="w-4 h-4 text-forest-green shrink-0" />
              <span className="text-sm text-gray-700">{lugar.telefono}</span>
            </a>
          )}

          {lugar.sitioWeb && (
            <a
              href={lugar.sitioWeb.startsWith('http') ? lugar.sitioWeb : `https://${lugar.sitioWeb}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm
                         hover:border-forest-green/30 hover:bg-green-50/50 transition-all"
            >
              <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 text-forest-green shrink-0" />
              <span className="text-sm text-forest-green truncate">{lugar.sitioWeb}</span>
            </a>
          )}
        </div>

        {/* CTA button */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          id="place-detail-directions"
          className="flex items-center justify-center gap-2 w-full bg-forest-green text-white
                     py-4 rounded-2xl font-bold text-sm shadow-lg
                     hover:bg-green-700 active:scale-[0.98] transition-all duration-200"
        >
          <FontAwesomeIcon icon={faLocationArrow} className="w-4 h-4" />
          ¿Cómo llegar?
        </a>
      </div>
    </div>
  );
};

export default DetalleLugar;
