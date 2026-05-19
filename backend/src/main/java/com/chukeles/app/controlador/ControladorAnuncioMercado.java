package com.chukeles.app.controlador;

import com.chukeles.app.modelo.AnuncioMercado;
import com.chukeles.app.servicio.ServicioAnuncioMercado;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador de anuncios de la tienda (marketplace).
 * 
 * GET    /api/mercado      → Listar todos los productos (público)
 * DELETE /api/mercado/{id} → Eliminar un anuncio (solo admin)
 */
@RestController
@RequestMapping("/api/mercado")
@RequiredArgsConstructor
@Tag(name = "Marketplace", description = "Endpoints para la tienda / mercado canino")
public class ControladorAnuncioMercado {

    private final ServicioAnuncioMercado servicioAnuncioMercado;

    @Operation(summary = "Obtener todos los anuncios del mercado")
    @GetMapping
    public ResponseEntity<List<AnuncioMercado>> obtenerTodos() {
        return ResponseEntity.ok(servicioAnuncioMercado.obtenerTodos());
    }

    @Operation(summary = "Eliminar un anuncio de mercado (admin)", security = @SecurityRequirement(name = "Bearer"))
    @PreAuthorize("hasAuthority('ROL_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        servicioAnuncioMercado.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
