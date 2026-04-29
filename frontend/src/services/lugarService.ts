import apiClient from './apiClient';

export interface Lugar {
  id: number;
  nombre: string;
  categoria: string;
  direccion: string;
  lat: number;
  lng: number;
  descripcion: string;
  fotoUrl: string;
}

export const fetchPlaces = async (): Promise<Lugar[]> => {
  const response = await apiClient.get<Lugar[]>('/lugares');
  return response.data;
};

export const fetchPlaceById = async (id: number): Promise<Lugar> => {
  const response = await apiClient.get<Lugar>(`/lugares/${id}`);
  return response.data;
};
