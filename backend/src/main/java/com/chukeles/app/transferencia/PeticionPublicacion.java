package com.chukeles.app.transferencia;

import com.chukeles.app.modelo.TipoPublicacion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO de entrada para crear una publicación en el tablón de anuncios (Anuncios).
 * Solo admite tipos DUDA e INFO. Las ventas van en el Mercado.
 */
@Data
public class PeticionPublicacion {

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @NotBlank(message = "El contenido es obligatorio")
    private String contenido;

    @NotNull(message = "El tipo de publicación es obligatorio")
    private TipoPublicacion tipo;

    /** URL de la foto (obtenida tras subir la imagen con /api/fotos) */
    private String fotoUrl;

    /** Datos de contacto del publicador (teléfono, email, etc.) */
    private String infoContacto;
}
