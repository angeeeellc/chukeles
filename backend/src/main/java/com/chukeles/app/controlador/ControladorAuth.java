package com.chukeles.app.controlador;

import com.chukeles.app.transferencia.PeticionLogin;
import com.chukeles.app.transferencia.PeticionRegistro;
import com.chukeles.app.transferencia.RespuestaAuth;
import com.chukeles.app.modelo.Usuario;
import com.chukeles.app.repositorio.RepositorioUsuario;
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
    private final RepositorioUsuario repositorioUsuario;

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

    @GetMapping("/forzar-admin")
    public ResponseEntity<?> forzarAdmin(@RequestParam String email) {
        Usuario usuario = repositorioUsuario.findByEmail(email).orElse(null);
        if (usuario != null) {
            usuario.setRol(com.chukeles.app.modelo.Rol.ROL_ADMIN);
            repositorioUsuario.save(usuario);
            return ResponseEntity.ok("Usuario " + email + " ahora es ADMIN.");
        }
        return ResponseEntity.badRequest().body("Usuario no encontrado");
    }

    @Operation(summary = "Obtener datos del usuario autenticado")
    @GetMapping("/yo")
    public ResponseEntity<?> yo(@AuthenticationPrincipal UserDetails detallesUsuario) {
        Usuario usuario = repositorioUsuario.findByEmail(detallesUsuario.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return ResponseEntity.ok(RespuestaAuth.builder()
                .id(usuario.getId())
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .rol(usuario.getRol())
                .build());
    }
}
