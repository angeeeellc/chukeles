package com.chukeles.app.controller;

import com.chukeles.app.dto.PeticionLogin;
import com.chukeles.app.dto.PeticionRegistro;
import com.chukeles.app.dto.RespuestaAuth;
import com.chukeles.app.model.Usuario;
import com.chukeles.app.repository.UsuarioRepository;
import com.chukeles.app.servicio.ServicioAuth;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador de autenticación.
 *
 * POST /api/auth/register → Registrar nuevo usuario (público)
 * POST /api/auth/login    → Login, devuelve token JWT (público)
 * GET  /api/auth/me       → Datos del usuario autenticado (privado)
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Registro, login y datos del usuario")
public class ControladorAuth {

    private final ServicioAuth servicioAuth;
    private final UsuarioRepository usuarioRepository;

    @Operation(summary = "Registrar un nuevo usuario")
    @PostMapping("/registro")
    public ResponseEntity<RespuestaAuth> registrar(@Valid @RequestBody PeticionRegistro peticion) {
        RespuestaAuth respuesta = servicioAuth.registrar(peticion);
        return ResponseEntity.ok(respuesta);
    }

    @Operation(summary = "Login de usuario, devuelve token JWT")
    @PostMapping("/login")
    public ResponseEntity<RespuestaAuth> login(@Valid @RequestBody PeticionLogin peticion) {
        RespuestaAuth respuesta = servicioAuth.login(peticion);
        return ResponseEntity.ok(respuesta);
    }

    @Operation(summary = "Obtener datos del usuario autenticado")
    @GetMapping("/yo")
    public ResponseEntity<?> yo(@AuthenticationPrincipal UserDetails detallesUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(detallesUsuario.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return ResponseEntity.ok(RespuestaAuth.builder()
                .id(usuario.getId())
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .rol(usuario.getRol())
                .build());
    }
}
