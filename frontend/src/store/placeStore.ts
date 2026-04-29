import { create } from 'zustand';
import { fetchPlaces, type Place } from '../services/placeService';

interface PlaceState {
  places: Place[];
  loading: boolean;
  error: string | null;
  loadPlaces: () => Promise<void>;
  selectedPlace: Place | null;
  setSelectedPlace: (place: Place | null) => void;
}

export const usePlaceStore = create<PlaceState>((set) => ({
  places: [],
  loading: false,
  error: null,
  selectedPlace: null,
  loadPlaces: async () => {
    set({ loading: true, error: null });
    try {
      const places = await fetchPlaces();
      set({ places, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  setSelectedPlace: (place) => set({ selectedPlace: place }),
}));
