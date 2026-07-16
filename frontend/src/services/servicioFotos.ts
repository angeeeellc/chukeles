import clienteApi from './clienteApi';

/**
 * Respuesta del endpoint POST /api/fotos/lugares/{id}
 */
export interface RespuestaFoto {
  fotoUrl: string;
}

/**
 * Sube una imagen y la asocia a un lugar existente.
 * Requiere token de administrador (ROL_ADMIN).
 *
 * @param id      ID del lugar al que asociar la foto
 * @param archivo Fichero JPG o PNG, máximo 5 MB
 * @returns La URL pública de la foto guardada
 */
export async function subirFotoLugar(id: number, archivo: File): Promise<RespuestaFoto> {
  const formData = new FormData();
  formData.append('archivo', archivo);

  const respuesta = await clienteApi.post<RespuestaFoto>(`/fotos/lugares/${id}`, formData, {
    headers: {
      // Sobreescribir Content-Type para que Axios añada el boundary correcto
      'Content-Type': 'multipart/form-data',
    },
  });

  return respuesta.data;
}
