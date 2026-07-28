package com.chukeles.app.controlador;

import com.chukeles.app.transferencia.PeticionLugar;
import com.chukeles.app.modelo.Categoria;
import com.chukeles.app.modelo.Lugar;
import com.chukeles.app.servicio.ServicioLugar;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador de lugares.
 *
 * GET    /api/lugares             → Listar con filtros opcionales (público)
 * GET    /api/lugares/{id}        → Detalle de un lugar (público)
 * GET    /api/categorias          → Listar categorías disponibles (público)
 * GET    /api/lugares/admin       → Listar todos los lugares (solo admin)
 * POST   /api/lugares             → Crear o sugerir lugar (autenticado)
 * PUT    /api/lugares/{id}        → Editar lugar (solo admin)
 * DELETE /api/lugares/{id}        → Eliminar lugar (solo admin)
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Lugares", description = "Búsqueda y gestión de lugares pet-friendly de A Coruña")
public class ControladorLugar {

    private final ServicioLugar servicioLugar;
    @Operation(summary = "Buscar lugares con filtros opcionales (nombre, categoría, radio)")
    @GetMapping("/api/lugares")
    public ResponseEntity<List<Lugar>> buscar(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Categoria categoria,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radio
    ) {
        List<Lugar> lugares = servicioLugar.buscarConFiltros(nombre, categoria, lat, lng, radio);
        return ResponseEntity.ok(lugares);
    }

    @Operation(summary = "Obtener el detalle de un lugar por su ID")
    @GetMapping("/api/lugares/{id}")
    public ResponseEntity<Lugar> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servicioLugar.obtenerPorId(id));
    }

    @Operation(summary = "Listar todas las categorías disponibles")
    @GetMapping("/api/categorias")
    public ResponseEntity<Categoria[]> listarCategorias() {
        return ResponseEntity.ok(Categoria.values());
    }
    @Operation(summary = "Listar todos los lugares (admin)", security = @SecurityRequirement(name = "Bearer"))
    @PreAuthorize("hasAuthority('ROL_ADMIN')")
    @GetMapping("/api/lugares/admin")
    public ResponseEntity<List<Lugar>> listarTodosAdmin() {
        return ResponseEntity.ok(servicioLugar.obtenerTodosAdmin());
    }

    @Operation(summary = "Crear o sugerir un nuevo lugar (autenticado)", security = @SecurityRequirement(name = "Bearer"))
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/api/lugares")
    public ResponseEntity<Lugar> crear(@Valid @RequestBody PeticionLugar peticion) {
        Lugar creado = servicioLugar.crear(peticion);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @Operation(summary = "Editar un lugar existente (admin)", security = @SecurityRequirement(name = "Bearer"))
    @PreAuthorize("hasAuthority('ROL_ADMIN')")
    @PutMapping("/api/lugares/{id}")
    public ResponseEntity<Lugar> editar(@PathVariable Long id, @Valid @RequestBody PeticionLugar peticion) {
        Lugar actualizado = servicioLugar.editar(id, peticion);
        return ResponseEntity.ok(actualizado);
    }

    @Operation(summary = "Eliminar un lugar (admin)", security = @SecurityRequirement(name = "Bearer"))
    @PreAuthorize("hasAuthority('ROL_ADMIN')")
    @DeleteMapping("/api/lugares/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        servicioLugar.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
