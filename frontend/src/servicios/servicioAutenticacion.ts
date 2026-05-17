import clienteApi from './clienteApi';

export interface RespuestaAuth {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  token: string;
}

export const loginApi = async (email: string, password: string): Promise<RespuestaAuth> => {
  const response = await clienteApi.post<RespuestaAuth>('/auth/login', { email, contrasena: password });
  return response.data;
};

export const registrarApi = async (
  nombre: string,
  email: string,
  password: string
): Promise<RespuestaAuth> => {
  const response = await clienteApi.post<RespuestaAuth>('/auth/registro', { nombre, email, contrasena: password });
  return response.data;
};

export const obtenerYoApi = async (): Promise<RespuestaAuth> => {
  const response = await clienteApi.get<RespuestaAuth>('/auth/yo');
  return response.data;
};
