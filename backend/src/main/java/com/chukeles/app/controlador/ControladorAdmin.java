package com.chukeles.app.controlador;

import com.chukeles.app.modelo.Rol;
import com.chukeles.app.modelo.Usuario;
import com.chukeles.app.repositorio.RepositorioUsuario;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class ControladorAdmin {

    private final RepositorioUsuario repositorioUsuario;

    /** Lista todos los usuarios registrados. */
    @GetMapping("/usuarios")
    @PreAuthorize("hasAuthority('ROL_ADMIN')")
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        return ResponseEntity.ok(repositorioUsuario.findAll());
    }

    /** Cambia el rol de un usuario (ROL_USUARIO ↔ ROL_ADMIN). */
    @PutMapping("/usuarios/{id}/rol")
    @PreAuthorize("hasAuthority('ROL_ADMIN')")
    public ResponseEntity<?> cambiarRol(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String nuevoRol = body.get("rol");
        if (nuevoRol == null || (!nuevoRol.equals("ROL_ADMIN") && !nuevoRol.equals("ROL_USUARIO"))) {
            return ResponseEntity.badRequest().body("Rol inválido");
        }

        Usuario usuario = repositorioUsuario.findById(id).orElse(null);
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }

        usuario.setRol(Rol.valueOf(nuevoRol));
        repositorioUsuario.save(usuario);

        return ResponseEntity.ok(usuario);
    }

    /** Bloquea o desbloquea un usuario. */
    @PutMapping("/usuarios/{id}/bloquear")
    @PreAuthorize("hasAuthority('ROL_ADMIN')")
    public ResponseEntity<?> bloquearUsuario(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Boolean bloqueado = body.get("bloqueado");
        if (bloqueado == null) {
            return ResponseEntity.badRequest().body("Campo 'bloqueado' requerido");
        }

        Usuario usuario = repositorioUsuario.findById(id).orElse(null);
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }

        // No permitir bloquear a otros admins
        if (usuario.getRol() == Rol.ROL_ADMIN) {
            return ResponseEntity.badRequest().body("No se puede bloquear a un administrador");
        }

        usuario.setBloqueado(bloqueado);
        repositorioUsuario.save(usuario);

        return ResponseEntity.ok(usuario);
    }

    /** Elimina permanentemente un usuario. */
    @DeleteMapping("/usuarios/{id}")
    @PreAuthorize("hasAuthority('ROL_ADMIN')")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        Usuario usuario = repositorioUsuario.findById(id).orElse(null);
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }

        // No permitir eliminar a otros admins
        if (usuario.getRol() == Rol.ROL_ADMIN) {
            return ResponseEntity.badRequest().body("No se puede eliminar a un administrador");
        }

        repositorioUsuario.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
