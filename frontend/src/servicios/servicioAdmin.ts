import clienteApi from './clienteApi';

export type TipoPublicacion = 'DUDA' | 'INFO' | 'VENTA';

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

export interface AnuncioMercado {
  id: number;
  titulo: string;
  precio: number;
  descripcion: string;
  fotoUrl?: string;
  categoria: string;
  estado: string;
  infoContacto?: string;
  autorId?: number;
  autorNombre?: string;
  creadoEn: string;
}

export interface Evento {
  id: number;
  titulo: string;
  fecha: string;
  hora: string;
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

// ── Endpoints del Tablón ──────────────────────────────────────────────────────
export const fetchPublicacionesAdmin = async (): Promise<PublicacionTablon[]> => {
  const response = await clienteApi.get<PublicacionTablon[]>('/tablon');
  return response.data;
};

export const eliminarPublicacionAdmin = async (id: number): Promise<void> => {
  await clienteApi.delete(`/tablon/${id}`);
};

// ── Endpoints del Mercado ─────────────────────────────────────────────────────
export const fetchAnunciosAdmin = async (): Promise<AnuncioMercado[]> => {
  const response = await clienteApi.get<AnuncioMercado[]>('/mercado');
  return response.data;
};

export const eliminarAnuncioAdmin = async (id: number): Promise<void> => {
  await clienteApi.delete(`/mercado/${id}`);
};

// ── Endpoints de Eventos (Quedadas) ───────────────────────────────────────────
export const fetchEventosAdmin = async (): Promise<Evento[]> => {
  const response = await clienteApi.get<Evento[]>('/eventos');
  return response.data;
};

export const eliminarEventoAdmin = async (id: number): Promise<void> => {
  await clienteApi.delete(`/eventos/${id}`);
};

// ── Endpoints de Usuarios ─────────────────────────────────────────────────────
export interface UsuarioAdmin {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  bloqueado: boolean;
}

export const fetchUsuariosAdmin = async (): Promise<UsuarioAdmin[]> => {
  const response = await clienteApi.get<UsuarioAdmin[]>('/admin/usuarios');
  return response.data;
};

export const cambiarRolUsuarioAdmin = async (id: number, rol: string): Promise<void> => {
  await clienteApi.put(`/admin/usuarios/${id}/rol`, { rol });
};

export const bloquearUsuarioAdmin = async (id: number, bloqueado: boolean): Promise<void> => {
  await clienteApi.put(`/admin/usuarios/${id}/bloquear`, { bloqueado });
};

export const eliminarUsuarioAdmin = async (id: number): Promise<void> => {
  await clienteApi.delete(`/admin/usuarios/${id}`);
};
