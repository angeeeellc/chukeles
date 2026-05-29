package com.chukeles.app.controlador;

import com.chukeles.app.servicio.ServicioAnuncioMercado;
import com.chukeles.app.transferencia.PeticionAnuncioMercado;
import com.chukeles.app.transferencia.RespuestaAnuncioMercado;
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
import java.util.Map;

/**
 * Controlador de anuncios de la tienda (marketplace).
 *
 * GET    /api/mercado                       → Listar (público, filtros opcionales)
 * GET    /api/mercado/{id}                  → Detalle (público)
 * POST   /api/mercado                       → Crear anuncio (autenticado)
 * PUT    /api/mercado/{id}/estado           → Marcar vendido/disponible (autor)
 * DELETE /api/mercado/{id}                  → Eliminar (autor o admin)
 */
@RestController
@RequestMapping("/api/mercado")
@RequiredArgsConstructor
@Tag(name = "Marketplace", description = "Endpoints para la tienda / mercado canino")
public class ControladorAnuncioMercado {

    private final ServicioAnuncioMercado servicioAnuncioMercado;

    @Operation(summary = "Listar anuncios del mercado con filtros opcionales")
    @GetMapping
    public ResponseEntity<List<RespuestaAnuncioMercado>> listar(
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String estado) {
        return ResponseEntity.ok(servicioAnuncioMercado.obtenerTodos(categoria, estado));
    }

    @Operation(summary = "Obtener detalle de un anuncio")
    @GetMapping("/{id}")
    public ResponseEntity<RespuestaAnuncioMercado> detalle(@PathVariable Long id) {
        return ResponseEntity.ok(servicioAnuncioMercado.obtenerPorId(id));
    }

    @Operation(summary = "Publicar un anuncio en el mercado", security = @SecurityRequirement(name = "Bearer"))
    @PostMapping
    public ResponseEntity<RespuestaAnuncioMercado> crear(
            @Valid @RequestBody PeticionAnuncioMercado peticion,
            Principal principal) {
        RespuestaAnuncioMercado creado = servicioAnuncioMercado.crear(peticion, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @Operation(summary = "Actualizar un anuncio en el mercado", security = @SecurityRequirement(name = "Bearer"))
    @PutMapping("/{id}")
    public ResponseEntity<RespuestaAnuncioMercado> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PeticionAnuncioMercado peticion,
            Principal principal) {
        return ResponseEntity.ok(servicioAnuncioMercado.actualizar(id, peticion, principal.getName()));
    }

    @Operation(summary = "Cambiar estado del anuncio (DISPONIBLE/VENDIDO)", security = @SecurityRequirement(name = "Bearer"))
    @PutMapping("/{id}/estado")
    public ResponseEntity<RespuestaAnuncioMercado> actualizarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Principal principal) {
        String nuevoEstado = body.getOrDefault("estado", "DISPONIBLE");
        return ResponseEntity.ok(servicioAnuncioMercado.actualizarEstado(id, nuevoEstado, principal.getName()));
    }

    @Operation(summary = "Eliminar un anuncio (autor o admin)", security = @SecurityRequirement(name = "Bearer"))
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, Principal principal) {
        servicioAnuncioMercado.eliminar(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}

