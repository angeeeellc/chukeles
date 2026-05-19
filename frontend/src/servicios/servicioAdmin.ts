import clienteApi from './clienteApi';

export interface PublicacionTablon {
  id: number;
  titulo: string;
  contenido: string;
  infoContacto?: string;
  creadoEn: string;
}

export interface AnuncioMercado {
  id: number;
  titulo: string;
  precio: number;
  descripcion: string;
  fotoUrl?: string;
  categoria: string;
  estado: string;
  creadoEn: string;
}

export interface Evento {
  id: number;
  titulo: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  lat: number;
  lng: number;
  maxParticipantes?: number;
  descripcion: string;
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
