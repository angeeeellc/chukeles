package com.chukeles.app.dto;

import com.chukeles.app.model.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta tras el login o registro exitoso.
 * Devuelve el token JWT y los datos básicos del usuario.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespuestaAuth {

    private String token;
    private Long id;
    private String email;
    private String nombre;
    private Rol rol;
}
