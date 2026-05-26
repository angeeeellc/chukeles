import clienteApi from './clienteApi';

export type TipoPublicacion = 'DUDA' | 'INFO';

export interface PublicacionTablon {
  id: number;
  titulo: string;
  contenido: string;
  tipo: TipoPublicacion;
  fotoUrl?: string;
  infoContacto?: string;
  creadoEn: string;
  autorId?: number;
  autorNombre?: string;
}

export interface NuevaPublicacion {
  titulo: string;
  contenido: string;
  tipo: TipoPublicacion;
  fotoUrl?: string;
  infoContacto?: string;
}

/** Obtiene todas las publicaciones, opcionalmente filtradas por tipo */
export const fetchPublicaciones = async (tipo?: TipoPublicacion): Promise<PublicacionTablon[]> => {
  const params = tipo ? { tipo } : {};
  const response = await clienteApi.get<PublicacionTablon[]>('/tablon', { params });
  return response.data;
};

/** Obtiene el detalle de una publicación por id */
export const fetchPublicacionPorId = async (id: number): Promise<PublicacionTablon> => {
  const response = await clienteApi.get<PublicacionTablon>(`/tablon/${id}`);
  return response.data;
};

/** Crea una nueva publicación (requiere autenticación) */
export const crearPublicacion = async (datos: NuevaPublicacion): Promise<PublicacionTablon> => {
  const response = await clienteApi.post<PublicacionTablon>('/tablon', datos);
  return response.data;
};

/** Elimina una publicación por id (autor o admin) */
export const eliminarPublicacion = async (id: number): Promise<void> => {
  await clienteApi.delete(`/tablon/${id}`);
};
