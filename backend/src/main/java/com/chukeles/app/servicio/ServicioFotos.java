package com.chukeles.app.servicio;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

/**
 * Servicio de subida de fotos.
 * <p>
 * Valida tipo MIME (jpg/png) y tamaño máximo (5 MB),
 * genera un nombre de fichero único y lo guarda en el
 * directorio configurado en {@code chukeles.upload.ruta}.
 * </p>
 * Devuelve la URL relativa pública: {@code /uploads/{nombre}}.
 */
@Service
public class ServicioFotos {

    private static final long TAMANO_MAXIMO_BYTES = 5L * 1024 * 1024; // 5 MB
    private static final List<String> TIPOS_PERMITIDOS = List.of("image/jpeg", "image/png");

    @Value("${chukeles.upload.ruta:./uploads}")
    private String rutaUpload;

    /**
     * Guarda el archivo en disco y devuelve la URL pública relativa.
     *
     * @param archivo   Fichero multipart recibido en la petición HTTP
     * @param entidad   Prefijo del nombre de fichero (ej: "lugar", "mercado")
     * @param entidadId ID de la entidad a la que pertenece la foto
     * @return URL pública relativa, ej: {@code /uploads/lugar_42_uuid.jpg}
     */
    public String guardar(MultipartFile archivo, String entidad, Long entidadId) {
        validar(archivo);

        // Determinar extensión a partir del tipo MIME
        String extension = archivo.getContentType().equals("image/png") ? "png" : "jpg";
        String nombreFichero = entidad + "_" + entidadId + "_" + UUID.randomUUID() + "." + extension;

        Path directorio = Paths.get(rutaUpload).toAbsolutePath().normalize();
        try {
            Files.createDirectories(directorio);
            Path destino = directorio.resolve(nombreFichero);
            try (InputStream is = archivo.getInputStream()) {
                Files.copy(is, destino, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new RuntimeException("No se pudo guardar el fichero: " + e.getMessage(), e);
        }

        return "/uploads/" + nombreFichero;
    }

    /**
     * Elimina un fichero de uploads por su URL relativa.
     * No lanza excepción si el fichero no existe.
     */
    public void eliminar(String fotoUrl) {
        if (fotoUrl == null || !fotoUrl.startsWith("/uploads/")) return;
        String nombreFichero = fotoUrl.substring("/uploads/".length());
        Path ruta = Paths.get(rutaUpload).toAbsolutePath().normalize().resolve(nombreFichero);
        try {
            Files.deleteIfExists(ruta);
        } catch (IOException ignored) {
            // Ignorado: si no se puede borrar el fichero antiguo, no es crítico
        }
    }
    private void validar(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("El archivo no puede estar vacío.");
        }
        if (archivo.getSize() > TAMANO_MAXIMO_BYTES) {
            throw new IllegalArgumentException("El archivo supera el tamaño máximo permitido de 5 MB.");
        }
        String tipo = archivo.getContentType();
        if (tipo == null || !TIPOS_PERMITIDOS.contains(tipo)) {
            throw new IllegalArgumentException("Tipo de archivo no permitido. Solo se aceptan JPG y PNG.");
        }
    }
}
