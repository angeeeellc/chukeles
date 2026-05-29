package com.chukeles.app.transferencia;

import com.chukeles.app.modelo.CategoriaMercado;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

/**
 * DTO de entrada para crear un anuncio en el marketplace.
 */
@Data
public class PeticionAnuncioMercado {

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor que cero")
    private Double precio;

    private String descripcion;

    private String fotoUrl;

    @NotNull(message = "La categoría es obligatoria")
    private CategoriaMercado categoria;

    private String infoContacto;
}
