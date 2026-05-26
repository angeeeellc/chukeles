package com.chukeles.app.transferencia;

import com.chukeles.app.modelo.PublicacionTablon;
import com.chukeles.app.modelo.TipoPublicacion;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO de salida para las publicaciones del tablón.
 * Evita serializar la entidad completa (y referencias circulares con Usuario).
 */
@Data
public class RespuestaPublicacion {

    private Long id;
    private String titulo;
    private String contenido;
    private TipoPublicacion tipo;
    private String fotoUrl;
    private String infoContacto;
    private LocalDateTime creadoEn;

    // Datos básicos del autor
    private Long autorId;
    private String autorNombre;

    /** Convierte la entidad al DTO de respuesta */
    public static RespuestaPublicacion from(PublicacionTablon pub) {
        RespuestaPublicacion dto = new RespuestaPublicacion();
        dto.setId(pub.getId());
        dto.setTitulo(pub.getTitulo());
        dto.setContenido(pub.getContenido());
        dto.setTipo(pub.getTipo());
        dto.setFotoUrl(pub.getFotoUrl());
        dto.setInfoContacto(pub.getInfoContacto());
        dto.setCreadoEn(pub.getCreadoEn());
        if (pub.getUsuario() != null) {
            dto.setAutorId(pub.getUsuario().getId());
            dto.setAutorNombre(pub.getUsuario().getNombre());
        }
        return dto;
    }
}
