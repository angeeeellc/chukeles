package com.chukeles.app.servicio;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Servicio de subida de fotos.
 * <p>
 * Valida tipo MIME (jpg/png) y tamaño máximo (5 MB),
 * y sube el archivo a Cloudinary para almacenamiento persistente.
 * </p>
 * Devuelve la URL pública segura de Cloudinary (https://res.cloudinary.com/...).
 */
@Service
public class ServicioFotos {

    private static final long TAMANO_MAXIMO_BYTES = 5L * 1024 * 1024; // 5 MB
    private static final List<String> TIPOS_PERMITIDOS = List.of("image/jpeg", "image/png");

    @Value("${chukeles.cloudinary.cloud-name}")
    private String cloudName;

    @Value("${chukeles.cloudinary.api-key}")
    private String apiKey;

    @Value("${chukeles.cloudinary.api-secret}")
    private String apiSecret;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        cloudinary = new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key",    apiKey,
            "api_secret", apiSecret,
            "secure",     true
        ));
    }

    /**
     * Sube el archivo a Cloudinary y devuelve la URL pública segura.
     *
     * @param archivo   Fichero multipart recibido en la petición HTTP
     * @param entidad   Carpeta de Cloudinary (ej: "lugar", "mercado")
     * @param entidadId ID de la entidad para nombrar el archivo
     * @return URL pública HTTPS de Cloudinary
     */
    public String guardar(MultipartFile archivo, String entidad, Long entidadId) {
        validar(archivo);

        try {
            String publicId = "chukeles/" + entidad + "_" + entidadId + "_" + System.currentTimeMillis();
            Map<?, ?> resultado = cloudinary.uploader().upload(
                archivo.getBytes(),
                ObjectUtils.asMap(
                    "public_id", publicId,
                    "overwrite", true,
                    "resource_type", "image"
                )
            );
            return (String) resultado.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("No se pudo subir la imagen a Cloudinary: " + e.getMessage(), e);
        }
    }

    /**
     * Elimina una imagen de Cloudinary por su URL pública.
     * No lanza excepción si el fichero no existe.
     */
    public void eliminar(String fotoUrl) {
        if (fotoUrl == null || !fotoUrl.contains("cloudinary.com")) return;
        try {
            // Extraer el public_id de la URL de Cloudinary
            // Formato: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}.{ext}
            String[] partes = fotoUrl.split("/upload/");
            if (partes.length < 2) return;
            String conVersion = partes[1]; // ej: v1234567890/chukeles/lugar_1_abc.jpg
            // Quitar la versión si existe
            String publicIdConExt = conVersion.replaceFirst("^v\\d+/", "");
            // Quitar la extensión
            String publicId = publicIdConExt.replaceAll("\\.[^.]+$", "");
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception ignored) {
            // Ignorado: si no se puede borrar la imagen antigua, no es crítico
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
