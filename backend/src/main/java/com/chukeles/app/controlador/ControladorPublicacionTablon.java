package com.chukeles.app.controlador;

import com.chukeles.app.modelo.PublicacionTablon;
import com.chukeles.app.servicio.ServicioPublicacionTablon;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador de publicaciones del tablón.
 * 
 * GET    /api/tablon      → Listar todas las publicaciones (público)
 * DELETE /api/tablon/{id} → Eliminar una publicación (solo admin)
 */
@RestController
@RequestMapping("/api/tablon")
@RequiredArgsConstructor
@Tag(name = "Tablón de Anuncios", description = "Endpoints para el tablón de anuncios comunitario")
public class ControladorPublicacionTablon {

    private final ServicioPublicacionTablon servicioPublicacionTablon;

    @Operation(summary = "Obtener todas las publicaciones del tablón")
    @GetMapping
    public ResponseEntity<List<PublicacionTablon>> obtenerTodas() {
        return ResponseEntity.ok(servicioPublicacionTablon.obtenerTodos());
    }

    @Operation(summary = "Eliminar una publicación del tablón (admin)", security = @SecurityRequirement(name = "Bearer"))
    @PreAuthorize("hasAuthority('ROL_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        servicioPublicacionTablon.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
