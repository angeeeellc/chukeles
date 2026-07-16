import clienteApi from './clienteApi';

export interface Evento {
  id: number;
  titulo: string;
  fecha: string;       // ISO date: "2026-06-15"
  hora: string;        // "HH:mm:ss"
  ubicacion: string;
  lat?: number;
  lng?: number;
  maxParticipantes?: number;
  descripcion?: string;
  autorId?: number;
  autorNombre?: string;
  numParticipantes: number;
  estaApuntado: boolean;
  creadoEn: string;
}

export interface NuevoEvento {
  titulo: string;
  fecha: string;       // "YYYY-MM-DD"
  hora: string;        // "HH:mm"
  ubicacion: string;
  lat?: number;
  lng?: number;
  maxParticipantes?: number;
  descripcion?: string;
}

/** Lista todos los eventos futuros */
export const fetchEventos = async (): Promise<Evento[]> => {
  const res = await clienteApi.get<Evento[]>('/eventos');
  return res.data;
};

/** Obtiene el detalle de un evento */
export const fetchEventoPorId = async (id: number): Promise<Evento> => {
  const res = await clienteApi.get<Evento>(`/eventos/${id}`);
  return res.data;
};

/** Crea un nuevo evento (requiere autenticación) */
export const crearEvento = async (datos: NuevoEvento): Promise<Evento> => {
  const res = await clienteApi.post<Evento>('/eventos', datos);
  return res.data;
};

/** Actualiza un evento (autor o admin) */
export const actualizarEvento = async (id: number, datos: NuevoEvento): Promise<Evento> => {
  const res = await clienteApi.put<Evento>(`/eventos/${id}`, datos);
  return res.data;
};

/** Apunta al usuario autenticado al evento */
export const unirseEvento = async (id: number): Promise<Evento> => {
  const res = await clienteApi.post<Evento>(`/eventos/${id}/unirse`);
  return res.data;
};

/** Desapunta al usuario autenticado del evento */
export const salirEvento = async (id: number): Promise<Evento> => {
  const res = await clienteApi.delete<Evento>(`/eventos/${id}/salir`);
  return res.data;
};

/** Elimina un evento (autor o admin) */
export const eliminarEvento = async (id: number): Promise<void> => {
  await clienteApi.delete(`/eventos/${id}`);
};
