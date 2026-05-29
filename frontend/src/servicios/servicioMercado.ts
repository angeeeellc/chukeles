import clienteApi from './clienteApi';

export type CategoriaMercado = 'COMIDA' | 'ACCESORIOS' | 'ROPA' | 'JUGUETES' | 'SALUD' | 'OTRO';
export type EstadoMercado = 'DISPONIBLE' | 'VENDIDO';

export interface AnuncioMercado {
  id: number;
  titulo: string;
  precio: number;
  descripcion?: string;
  fotoUrl?: string;
  categoria: CategoriaMercado;
  estado: EstadoMercado;
  infoContacto?: string;
  autorId?: number;
  autorNombre?: string;
  creadoEn: string;
}

export interface NuevoAnuncio {
  titulo: string;
  precio: number;
  descripcion?: string;
  fotoUrl?: string;
  categoria: CategoriaMercado;
  infoContacto?: string;
}

/** Lista todos los anuncios con filtros opcionales */
export const fetchAnuncios = async (
  categoria?: CategoriaMercado | null,
  estado?: EstadoMercado | null
): Promise<AnuncioMercado[]> => {
  const params: Record<string, string> = {};
  if (categoria) params.categoria = categoria;
  if (estado) params.estado = estado;
  const res = await clienteApi.get<AnuncioMercado[]>('/mercado', { params });
  return res.data;
};

/** Obtiene el detalle de un anuncio */
export const fetchAnuncioPorId = async (id: number): Promise<AnuncioMercado> => {
  const res = await clienteApi.get<AnuncioMercado>(`/mercado/${id}`);
  return res.data;
};

/** Crea un nuevo anuncio (requiere autenticación) */
export const crearAnuncio = async (datos: NuevoAnuncio): Promise<AnuncioMercado> => {
  const res = await clienteApi.post<AnuncioMercado>('/mercado', datos);
  return res.data;
};

/** Actualiza un anuncio (autor o admin) */
export const actualizarAnuncio = async (id: number, datos: NuevoAnuncio): Promise<AnuncioMercado> => {
  const res = await clienteApi.put<AnuncioMercado>(`/mercado/${id}`, datos);
  return res.data;
};

/** Cambia el estado de un anuncio a VENDIDO o DISPONIBLE (solo el autor) */
export const actualizarEstadoAnuncio = async (
  id: number,
  estado: EstadoMercado
): Promise<AnuncioMercado> => {
  const res = await clienteApi.put<AnuncioMercado>(`/mercado/${id}/estado`, { estado });
  return res.data;
};

/** Elimina un anuncio (autor o admin) */
export const eliminarAnuncio = async (id: number): Promise<void> => {
  await clienteApi.delete(`/mercado/${id}`);
};
