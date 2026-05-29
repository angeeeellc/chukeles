package com.chukeles.app.transferencia;

import com.chukeles.app.modelo.Evento;
import com.chukeles.app.modelo.Usuario;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * DTO de salida para las quedadas caninas.
 * Incluye datos del organizador, número de participantes y si el usuario actual está apuntado.
 */
@Data
@Builder
public class RespuestaEvento {

    private Long id;
    private String titulo;
    private LocalDate fecha;
    private LocalTime hora;
    private String ubicacion;
    private Double lat;
    private Double lng;
    private Integer maxParticipantes;
    private String descripcion;
    private Long autorId;
    private String autorNombre;
    private int numParticipantes;
    private boolean estaApuntado;
    private LocalDateTime creadoEn;

    public static RespuestaEvento desde(Evento e, Usuario usuarioActual) {
        boolean apuntado = usuarioActual != null && e.getParticipantes() != null
                && e.getParticipantes().stream().anyMatch(p -> p.getId().equals(usuarioActual.getId()));

        return RespuestaEvento.builder()
                .id(e.getId())
                .titulo(e.getTitulo())
                .fecha(e.getFecha())
                .hora(e.getHora())
                .ubicacion(e.getUbicacion())
                .lat(e.getLat())
                .lng(e.getLng())
                .maxParticipantes(e.getMaxParticipantes())
                .descripcion(e.getDescripcion())
                .autorId(e.getUsuario() != null ? e.getUsuario().getId() : null)
                .autorNombre(e.getUsuario() != null ? e.getUsuario().getNombre() : null)
                .numParticipantes(e.getParticipantes() != null ? e.getParticipantes().size() : 0)
                .estaApuntado(apuntado)
                .creadoEn(e.getCreadoEn())
                .build();
    }
}
