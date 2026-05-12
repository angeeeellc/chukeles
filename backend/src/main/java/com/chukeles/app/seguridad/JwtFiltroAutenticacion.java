package com.chukeles.app.seguridad;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro JWT: se ejecuta una vez por petición.
 * Extrae el token del header "Authorization: Bearer <token>",
 * lo valida y establece la autenticación en el SecurityContext.
 */
@Component
@RequiredArgsConstructor
public class JwtFiltroAutenticacion extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final ServicioDetallesUsuario servicioDetallesUsuario;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);

        try {
            final String email = jwtUtil.extraerEmail(token);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails detallesUsuario = servicioDetallesUsuario.loadUserByUsername(email);

                if (jwtUtil.esTokenValido(token, detallesUsuario)) {
                    UsernamePasswordAuthenticationToken autenticacion =
                            new UsernamePasswordAuthenticationToken(
                                    detallesUsuario,
                                    null,
                                    detallesUsuario.getAuthorities()
                            );
                    autenticacion.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(autenticacion);
                }
            }
        } catch (Exception e) {
            // Token inválido o expirado: seguimos sin autenticación
            logger.warn("Error al procesar el token JWT: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
