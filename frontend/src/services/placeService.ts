import apiClient from './apiClient';

export interface Place {
  id: number;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  photoUrl: string;
}

export const fetchPlaces = async (): Promise<Place[]> => {
  const response = await apiClient.get<Place[]>('/places');
  return response.data;
};

export const fetchPlaceById = async (id: number): Promise<Place> => {
  const response = await apiClient.get<Place>(`/places/${id}`);
  return response.data;
};
