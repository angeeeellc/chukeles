import clienteApi from './clienteApi';

export interface Lugar {
  id: number;
  nombre: string;
  categoria: string;
  direccion: string;
  lat: number;
  lng: number;
  descripcion: string;
  fotoUrl: string;
  telefono?: string;
  sitioWeb?: string;
}

export interface FiltrosLugar {
  nombre?: string;
  categoria?: string;
  lat?: number;
  lng?: number;
  radio?: number;
}

export const fetchPlaces = async (): Promise<Lugar[]> => {
  const response = await clienteApi.get<Lugar[]>('/lugares');
  return response.data;
};

export const buscarLugares = async (filtros: FiltrosLugar): Promise<Lugar[]> => {
  const params: Record<string, string | number> = {};
  if (filtros.nombre)    params.nombre    = filtros.nombre;
  if (filtros.categoria) params.categoria = filtros.categoria;
  if (filtros.lat !== undefined) params.lat = filtros.lat;
  if (filtros.lng !== undefined) params.lng = filtros.lng;
  if (filtros.radio)     params.radio     = filtros.radio;

  const response = await clienteApi.get<Lugar[]>('/lugares', { params });
  return response.data;
};

export const fetchPlaceById = async (id: number): Promise<Lugar> => {
  const response = await clienteApi.get<Lugar>(`/lugares/${id}`);
  return response.data;
};
