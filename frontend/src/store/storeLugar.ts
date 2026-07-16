import { create } from 'zustand';
import { buscarLugares, type Lugar, type FiltrosLugar } from '../services/servicioLugar';

interface PlaceState {
  lugares: Lugar[];
  cargando: boolean;
  error: string | null;
  filtros: FiltrosLugar;
  lugarSeleccionado: Lugar | null;

  cargarLugares: () => Promise<void>;
  setFiltros: (filtros: Partial<FiltrosLugar>) => void;
  resetFiltros: () => void;
  setLugarSeleccionado: (lugar: Lugar | null) => void;
}

const FILTROS_VACIOS: FiltrosLugar = {
  nombre: '',
  categoria: '',
  lat: undefined,
  lng: undefined,
  radio: undefined,
};

export const useLugarStore = create<PlaceState>((set, get) => ({
  lugares: [],
  cargando: false,
  error: null,
  filtros: FILTROS_VACIOS,
  lugarSeleccionado: null,

  cargarLugares: async () => {
    set({ cargando: true, error: null });
    try {
      const lugares = await buscarLugares(get().filtros);
      set({ lugares, cargando: false });
    } catch (err: any) {
      set({ error: err.message, cargando: false });
    }
  },

  setFiltros: (nuevosFiltros) => {
    set((state) => ({ filtros: { ...state.filtros, ...nuevosFiltros } }));
    get().cargarLugares();
  },

  resetFiltros: () => {
    set({ filtros: FILTROS_VACIOS });
    get().cargarLugares();
  },

  setLugarSeleccionado: (lugar) => set({ lugarSeleccionado: lugar }),
}));
