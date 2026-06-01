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

    @GetMapping("/usuarios")
    @PreAuthorize("hasAuthority('ROL_ADMIN')")
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        return ResponseEntity.ok(repositorioUsuario.findAll());
    }

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
}
