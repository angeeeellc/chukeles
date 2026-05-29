package com.chukeles.app.transferencia;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO de entrada para crear una quedada canina.
 */
@Data
public class PeticionEvento {

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @NotNull(message = "La fecha es obligatoria")
    @FutureOrPresent(message = "La fecha debe ser hoy o en el futuro")
    private LocalDate fecha;

    @NotNull(message = "La hora es obligatoria")
    private LocalTime hora;

    @NotBlank(message = "La ubicación es obligatoria")
    private String ubicacion;

    private Double lat;
    private Double lng;

    private Integer maxParticipantes;

    private String descripcion;
}
