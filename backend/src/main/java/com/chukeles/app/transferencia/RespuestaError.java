package com.chukeles.app.transferencia;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO generico para respuestas de error de la API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RespuestaError {

    private int estado;
    private String mensaje;
}
