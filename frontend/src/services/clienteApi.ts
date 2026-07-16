import axios from 'axios';

const clienteApi = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
clienteApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
clienteApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    // Importación dinámica para evitar dependencias circulares
    const { useUiStore } = await import('../store/storeUi');
    const addToast = useUiStore.getState().addToast;

    if (status === 401) {
      // Token expirado o inválido → limpiar sesión
      localStorage.removeItem('token');
      const { useUserStore } = await import('../store/storeUsuario');
      useUserStore.getState().logout();
      addToast('Tu sesión ha expirado. Por favor, vuelve a acceder.', 'error');
      window.location.href = '/iniciar-sesion';
    } else if (status === 403) {
      addToast('No tienes permisos para realizar esta acción.', 'error');
    } else if (status === 404) {
      addToast('El recurso solicitado no existe.', 'info');
    } else if (status >= 500) {
      addToast('Error interno del servidor. Inténtalo de nuevo.', 'error');
    } else if (!error.response) {
      addToast('Sin conexión. Comprueba tu red e inténtalo de nuevo.', 'error');
    }

    return Promise.reject(error);
  }
);

export default clienteApi;
