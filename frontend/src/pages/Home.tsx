import { useEffect } from 'react'
import { useLugarStore } from '../store/lugarStore'
import type { Lugar } from '../services/lugarService'
import MapComponent from '../components/MapComponent'

const Home = () => {
  const traducirCategoria = (cat: string) => {
    const map: Record<string, string> = {
      'VET': 'VETERINARIO',
      'PARK': 'PARQUE',
      'GROOMING': 'PELUQUERIA',
      'STORE': 'TIENDA',
      'HOTEL': 'HOTEL',
      'TRAINING': 'ADIESTRAMIENTO',
      'OTHER': 'OTRO'
    };
    return map[cat.toUpperCase()] || cat;
  };

  const { lugares, cargando, error, cargarLugares, lugarSeleccionado, setLugarSeleccionado } = useLugarStore()

  useEffect(() => {
    cargarLugares()
  }, [cargarLugares])

  return (
    // Ocupa todo el espacio disponible bajo el header de la app, sin scroll exterior
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>

      {/* Barra de búsqueda / título */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        zIndex: 10,
      }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', margin: 0 }}>Explorar A Coruña</h2>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>{lugares.length} lugares para tu mascota</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ background: '#f3f4f6', border: 'none', padding: '6px 16px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Filtros</button>
          <button style={{ background: 'rgba(45,106,79,0.1)', border: 'none', padding: '6px 16px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, color: '#2d6a4f', cursor: 'pointer' }}>Categorías</button>
        </div>
      </div>

      {/* Contenido principal: sidebar + mapa — NUNCA hace scroll vertical en este nivel */}
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* Sidebar de lugares — SOLO AQUÍ hay scroll */}
        <div style={{
          width: '380px',
          minWidth: '320px',
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          background: '#f9fafb',
          borderRight: '1px solid #e5e7eb',
          flexShrink: 0,
        }}>
          {cargando && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', border: '4px solid rgba(45,106,79,0.2)', borderTopColor: '#2d6a4f', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '13px', color: '#9ca3af' }}>Buscando lugares...</p>
            </div>
          )}
          {error && (
            <div style={{ margin: '16px', padding: '16px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', textAlign: 'center', color: '#dc2626', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {lugares.map((lugar: Lugar) => (
              <div
                key={lugar.id}
                onClick={() => setLugarSeleccionado(lugar)}
                style={{
                  background: '#fff',
                  border: lugarSeleccionado?.id === lugar.id ? '2px solid #2d6a4f' : '1px solid #f3f4f6',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: lugarSeleccionado?.id === lugar.id ? '0 8px 24px rgba(45,106,79,0.15)' : '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'all 0.25s ease',
                  transform: lugarSeleccionado?.id === lugar.id ? 'scale(1.01)' : 'scale(1)',
                }}
              >
                {lugar.fotoUrl && (
                  <div style={{ width: '100%', height: '180px', overflow: 'hidden', position: 'relative', background: '#e5e7eb' }}>
                    <img
                      src={lugar.fotoUrl}
                      alt={lugar.nombre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                      onError={(e) => {
                        // Fallback a imagen genérica si Unsplash no carga
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800';
                        (e.target as HTMLImageElement).onerror = null;
                      }}
                    />
                    <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                      <span style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)', color: '#2d6a4f', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                        {traducirCategoria(lugar.categoria)}
                      </span>
                    </div>
                  </div>
                )}
                <div style={{ padding: '14px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '14px', color: '#1f2937', margin: '0 0 4px', lineHeight: 1.3 }}>{lugar.nombre}</h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 10px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {lugar.descripcion}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #f9fafb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '11px', color: '#9ca3af', overflow: 'hidden', maxWidth: '70%' }}>
                      <svg style={{ width: '12px', height: '12px', marginRight: '4px', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lugar.direccion}</span>
                    </div>
                    <button style={{ fontSize: '10px', fontWeight: 700, color: '#2d6a4f', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Ver más
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mapa — SIEMPRE visible, ocupa el espacio restante */}
        <div style={{ flex: 1, height: '100%', position: 'relative', minWidth: 0 }}>
          <MapComponent lugares={lugares} />
        </div>

      </div>
    </div>
  )
}

export default Home
