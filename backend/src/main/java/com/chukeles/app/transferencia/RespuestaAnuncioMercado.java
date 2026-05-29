package com.chukeles.app.transferencia;

import com.chukeles.app.modelo.AnuncioMercado;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO de salida para los anuncios del marketplace.
 * Incluye datos del autor sin exponer la entidad Usuario completa.
 */
@Data
@Builder
public class RespuestaAnuncioMercado {

    private Long id;
    private String titulo;
    private Double precio;
    private String descripcion;
    private String fotoUrl;
    private String categoria;
    private String estado;
    private String infoContacto;
    private Long autorId;
    private String autorNombre;
    private LocalDateTime creadoEn;

    public static RespuestaAnuncioMercado desde(AnuncioMercado a) {
        return RespuestaAnuncioMercado.builder()
                .id(a.getId())
                .titulo(a.getTitulo())
                .precio(a.getPrecio())
                .descripcion(a.getDescripcion())
                .fotoUrl(a.getFotoUrl())
                .categoria(a.getCategoria() != null ? a.getCategoria().name() : null)
                .estado(a.getEstado())
                .infoContacto(a.getInfoContacto())
                .autorId(a.getUsuario() != null ? a.getUsuario().getId() : null)
                .autorNombre(a.getUsuario() != null ? a.getUsuario().getNombre() : null)
                .creadoEn(a.getCreadoEn())
                .build();
    }
}
