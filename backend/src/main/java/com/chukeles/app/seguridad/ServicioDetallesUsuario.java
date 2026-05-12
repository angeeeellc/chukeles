package com.chukeles.app.seguridad;

import com.chukeles.app.model.Usuario;
import com.chukeles.app.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Carga los detalles del usuario desde la base de datos para Spring Security.
 */
@Service
@RequiredArgsConstructor
public class ServicioDetallesUsuario implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con email: " + email));

        return new org.springframework.security.core.userdetails.User(
                usuario.getEmail(),
                usuario.getContrasena(),
                List.of(new SimpleGrantedAuthority(usuario.getRol().name()))
        );
    }
}
