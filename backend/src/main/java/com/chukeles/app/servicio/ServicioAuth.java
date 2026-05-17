package com.chukeles.app.servicio;

import com.chukeles.app.transferencia.PeticionLogin;
import com.chukeles.app.transferencia.PeticionRegistro;
import com.chukeles.app.transferencia.RespuestaAuth;
import com.chukeles.app.modelo.Rol;
import com.chukeles.app.modelo.Usuario;
import com.chukeles.app.repositorio.RepositorioUsuario;
import com.chukeles.app.seguridad.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Servicio de autenticación.
 * Gestiona el registro, el login y la generación de tokens JWT.
 */
@Service
@RequiredArgsConstructor
public class ServicioAuth {

    private final RepositorioUsuario repositorioUsuario;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final com.chukeles.app.seguridad.ServicioDetallesUsuario servicioDetallesUsuario;

    public RespuestaAuth registrar(PeticionRegistro peticion) {
        if (repositorioUsuario.findByEmail(peticion.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Ya existe un usuario con ese email");
        }

        Usuario nuevoUsuario = Usuario.builder()
                .email(peticion.getEmail())
                .contrasena(passwordEncoder.encode(peticion.getContrasena()))
                .nombre(peticion.getNombre())
                .telefono(peticion.getTelefono())
                .rol(Rol.ROL_USUARIO)
                .build();

        repositorioUsuario.save(nuevoUsuario);

        UserDetails detallesUsuario = servicioDetallesUsuario.loadUserByUsername(nuevoUsuario.getEmail());
        String token = jwtUtil.generarToken(detallesUsuario);

        return RespuestaAuth.builder()
                .token(token)
                .id(nuevoUsuario.getId())
                .email(nuevoUsuario.getEmail())
                .nombre(nuevoUsuario.getNombre())
                .rol(nuevoUsuario.getRol())
                .build();
    }

    public RespuestaAuth login(PeticionLogin peticion) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(peticion.getEmail(), peticion.getContrasena())
        );

        Usuario usuario = repositorioUsuario.findByEmail(peticion.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales incorrectas"));

        UserDetails detallesUsuario = servicioDetallesUsuario.loadUserByUsername(usuario.getEmail());
        String token = jwtUtil.generarToken(detallesUsuario);

        return RespuestaAuth.builder()
                .token(token)
                .id(usuario.getId())
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .rol(usuario.getRol())
                .build();
    }
}
