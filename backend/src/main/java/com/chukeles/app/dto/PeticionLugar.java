package com.chukeles.app.dto;

import com.chukeles.app.model.Categoria;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO para crear o editar un lugar.
 * Usado en los endpoints POST y PUT de /api/lugares.
 */
@Data
public class PeticionLugar {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotNull(message = "La categoría es obligatoria")
    private Categoria categoria;

    @NotBlank(message = "La dirección es obligatoria")
    private String direccion;

    @NotNull(message = "La latitud es obligatoria")
    private Double lat;

    @NotNull(message = "La longitud es obligatoria")
    private Double lng;

    private String descripcion;
    private String telefono;
    private String sitioWeb;
    private String fotoUrl;
    private Boolean aprobado;
}
