import { create } from 'zustand';
import { fetchPlaces, type Lugar } from '../services/lugarService';

interface PlaceState {
  lugares: Lugar[];
  cargando: boolean;
  error: string | null;
  cargarLugares: () => Promise<void>;
  lugarSeleccionado: Lugar | null;
  setLugarSeleccionado: (lugar: Lugar | null) => void;
}

export const useLugarStore = create<PlaceState>((set) => ({
  lugares: [],
  cargando: false,
  error: null,
  lugarSeleccionado: null,
  cargarLugares: async () => {
    set({ cargando: true, error: null });
    try {
      const lugares = await fetchPlaces();
      set({ lugares, cargando: false });
    } catch (err: any) {
      set({ error: err.message, cargando: false });
    }
  },
  setLugarSeleccionado: (lugar) => set({ lugarSeleccionado: lugar }),
}));
