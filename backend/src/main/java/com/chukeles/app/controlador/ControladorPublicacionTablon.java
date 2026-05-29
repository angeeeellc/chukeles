package com.chukeles.app.controlador;

import com.chukeles.app.modelo.TipoPublicacion;
import com.chukeles.app.servicio.ServicioPublicacionTablon;
import com.chukeles.app.transferencia.PeticionPublicacion;
import com.chukeles.app.transferencia.RespuestaPublicacion;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador del tablón de anuncios comunitario.
 *
 * GET    /api/tablon?tipo=DUDA  → Listar publicaciones (público, filtro opcional)
 * GET    /api/tablon/{id}       → Detalle de una publicación (público)
 * POST   /api/tablon            → Crear publicación (autenticado)
 * DELETE /api/tablon/{id}       → Eliminar (autor o admin)
 */
@RestController
@RequestMapping("/api/tablon")
@RequiredArgsConstructor
@Tag(name = "Tablón de Anuncios", description = "Endpoints para el tablón de anuncios comunitario")
public class ControladorPublicacionTablon {

    private final ServicioPublicacionTablon servicioPublicacionTablon;

    @Operation(summary = "Listar publicaciones del tablón (filtro por tipo opcional)")
    @GetMapping
    public ResponseEntity<List<RespuestaPublicacion>> obtenerTodas(
            @RequestParam(required = false) TipoPublicacion tipo) {
        List<RespuestaPublicacion> resultado = servicioPublicacionTablon.obtenerTodos(tipo)
                .stream()
                .map(RespuestaPublicacion::from)
                .toList();
        return ResponseEntity.ok(resultado);
    }

    @Operation(summary = "Obtener el detalle de una publicación")
    @GetMapping("/{id}")
    public ResponseEntity<RespuestaPublicacion> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(
                RespuestaPublicacion.from(servicioPublicacionTablon.obtenerPorId(id)));
    }

    @Operation(summary = "Publicar un anuncio en el tablón (requiere autenticación)",
               security = @SecurityRequirement(name = "Bearer"))
    @PostMapping
    public ResponseEntity<RespuestaPublicacion> crear(
            @Valid @RequestBody PeticionPublicacion peticion,
            Authentication auth) {
        String email = auth.getName();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(RespuestaPublicacion.from(
                        servicioPublicacionTablon.crear(peticion, email)));
    }

    @Operation(summary = "Actualizar una publicación (autor o admin)",
               security = @SecurityRequirement(name = "Bearer"))
    @PutMapping("/{id}")
    public ResponseEntity<RespuestaPublicacion> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PeticionPublicacion peticion,
            Authentication auth) {
        String email = auth.getName();
        return ResponseEntity.ok(RespuestaPublicacion.from(
                servicioPublicacionTablon.actualizar(id, peticion, email)));
    }

    @Operation(summary = "Eliminar una publicación (autor o admin)",
               security = @SecurityRequirement(name = "Bearer"))
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, Authentication auth) {
        servicioPublicacionTablon.eliminar(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
