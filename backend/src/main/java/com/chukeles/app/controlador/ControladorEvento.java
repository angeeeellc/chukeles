package com.chukeles.app.controlador;

import com.chukeles.app.servicio.ServicioEvento;
import com.chukeles.app.transferencia.PeticionEvento;
import com.chukeles.app.transferencia.RespuestaEvento;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * Controlador de quedadas caninas (eventos).
 *
 * GET    /api/eventos                → Listar eventos futuros (público)
 * GET    /api/eventos/{id}           → Detalle de un evento (público)
 * POST   /api/eventos                → Crear quedada (autenticado)
 * POST   /api/eventos/{id}/unirse    → Apuntarse a una quedada (autenticado)
 * DELETE /api/eventos/{id}/salir     → Salir de una quedada (autenticado)
 * DELETE /api/eventos/{id}           → Eliminar quedada (autor o admin)
 */
@RestController
@RequestMapping("/api/eventos")
@RequiredArgsConstructor
@Tag(name = "Quedadas Caninas", description = "Endpoints para la organización de quedadas de perros")
public class ControladorEvento {

    private final ServicioEvento servicioEvento;

    @Operation(summary = "Listar eventos futuros")
    @GetMapping
    public ResponseEntity<List<RespuestaEvento>> listar(Principal principal) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(servicioEvento.obtenerTodos(email));
    }

    @Operation(summary = "Obtener detalle de un evento")
    @GetMapping("/{id}")
    public ResponseEntity<RespuestaEvento> detalle(@PathVariable Long id, Principal principal) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(servicioEvento.obtenerPorId(id, email));
    }

    @Operation(summary = "Crear una quedada canina", security = @SecurityRequirement(name = "Bearer"))
    @PostMapping
    public ResponseEntity<RespuestaEvento> crear(
            @Valid @RequestBody PeticionEvento peticion,
            Principal principal) {
        RespuestaEvento creado = servicioEvento.crear(peticion, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @Operation(summary = "Actualizar una quedada", security = @SecurityRequirement(name = "Bearer"))
    @PutMapping("/{id}")
    public ResponseEntity<RespuestaEvento> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PeticionEvento peticion,
            Principal principal) {
        return ResponseEntity.ok(servicioEvento.actualizar(id, peticion, principal.getName()));
    }

    @Operation(summary = "Apuntarse a una quedada", security = @SecurityRequirement(name = "Bearer"))
    @PostMapping("/{id}/unirse")
    public ResponseEntity<RespuestaEvento> unirse(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(servicioEvento.unirse(id, principal.getName()));
    }

    @Operation(summary = "Salir de una quedada", security = @SecurityRequirement(name = "Bearer"))
    @DeleteMapping("/{id}/salir")
    public ResponseEntity<RespuestaEvento> salir(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(servicioEvento.salir(id, principal.getName()));
    }

    @Operation(summary = "Eliminar una quedada (autor o admin)", security = @SecurityRequirement(name = "Bearer"))
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, Principal principal) {
        servicioEvento.eliminar(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}

