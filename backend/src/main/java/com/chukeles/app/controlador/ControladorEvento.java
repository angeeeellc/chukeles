package com.chukeles.app.controlador;

import com.chukeles.app.modelo.Evento;
import com.chukeles.app.servicio.ServicioEvento;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador de quedadas caninas (eventos).
 * 
 * GET    /api/eventos      → Listar todas las quedadas (público)
 * DELETE /api/eventos/{id} → Eliminar una quedada (solo admin)
 */
@RestController
@RequestMapping("/api/eventos")
@RequiredArgsConstructor
@Tag(name = "Quedadas Caninas", description = "Endpoints para la organización de quedadas de perros")
public class ControladorEvento {

    private final ServicioEvento servicioEvento;

    @Operation(summary = "Obtener todas las quedadas futuras")
    @GetMapping
    public ResponseEntity<List<Evento>> obtenerTodas() {
        return ResponseEntity.ok(servicioEvento.obtenerTodos());
    }

    @Operation(summary = "Eliminar una quedada (admin)", security = @SecurityRequirement(name = "Bearer"))
    @PreAuthorize("hasAuthority('ROL_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        servicioEvento.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
