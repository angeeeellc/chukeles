package com.chukeles.app.controlador;

import com.chukeles.app.modelo.Lugar;
import com.chukeles.app.servicio.ServicioFotos;
import com.chukeles.app.servicio.ServicioLugar;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Controlador de subida de fotos.
 *
 * POST /api/fotos/lugares/{id}  → Admin · Asocia una foto a un lugar
 *
 * Endpoint genérico preparado para Fases 7 y 8:
 * POST /api/fotos/mercado/{id}  → Autenticado · (futuro Marketplace)
 * POST /api/fotos/tablon/{id}   → Autenticado · (futuro Tablón)
 */
@RestController
@RequestMapping("/api/fotos")
@RequiredArgsConstructor
@Tag(name = "Fotos", description = "Subida y gestión de imágenes de entidades")
public class ControladorFotos {

    private final ServicioFotos servicioFotos;
    private final ServicioLugar servicioLugar;

    /**
     * Sube una foto y la asocia a un lugar existente.
     * Solo accesible para administradores.
     *
     * @param id      ID del lugar
     * @param archivo Fichero JPG o PNG, máximo 5 MB
     * @return JSON con la URL pública de la foto: { "fotoUrl": "/uploads/..." }
     */
    @Operation(
        summary = "Subir foto de un lugar (admin)",
        security = @SecurityRequirement(name = "Bearer")
    )
    @PreAuthorize("hasAuthority('ROL_ADMIN')")
    @PostMapping(
        value = "/lugares/{id}",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, String>> subirFotoLugar(
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo
    ) {
        // 1. Guardar el fichero en disco y obtener la URL relativa
        String fotoUrl = servicioFotos.guardar(archivo, "lugar", id);

        // 2. Actualizar la entidad en base de datos
        Lugar lugar = servicioLugar.actualizarFoto(id, fotoUrl);

        // 3. Devolver la URL para que el frontend pueda mostrar la imagen
        return ResponseEntity.ok(Map.of("fotoUrl", lugar.getFotoUrl()));
    }
}
