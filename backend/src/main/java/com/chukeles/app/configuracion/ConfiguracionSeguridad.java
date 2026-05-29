package com.chukeles.app.configuracion;

import com.chukeles.app.seguridad.JwtFiltroAutenticacion;
import com.chukeles.app.seguridad.ServicioDetallesUsuario;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuración de seguridad de la aplicación.
 * Define rutas públicas, privadas (usuario) y privadas (admin).
 * Registra el filtro JWT y configura sesión sin estado (stateless).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class ConfiguracionSeguridad {

    private final JwtFiltroAutenticacion jwtFiltroAutenticacion;
    private final ServicioDetallesUsuario servicioDetallesUsuario;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> 
                    response.sendError(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED, authException.getMessage())
                )
            )
            .authorizeHttpRequests(auth -> auth
                // ── Rutas públicas ──────────────────────────────────────────
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/lugares/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categorias/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/eventos/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/tablon/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/mercado/**").permitAll()
                // Fotos subidas: acceso público de lectura
                .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                // Swagger / H2 console
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/h2-console/**"
                ).permitAll()
                // ── Rutas de admin (solo ROL_ADMIN) ─────────────────────────
                .requestMatchers(HttpMethod.POST,   "/api/lugares/**").hasAuthority("ROL_ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/lugares/**").hasAuthority("ROL_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/lugares/**").hasAuthority("ROL_ADMIN")
                // ── Todo lo demás requiere autenticación ────────────────────
                // DELETE /api/mercado, DELETE /api/eventos, POST /api/eventos/{id}/unirse:
                // el control de autor vs. admin se delega al servicio correspondiente
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtFiltroAutenticacion, UsernamePasswordAuthenticationFilter.class);

        // Necesario para que la consola H2 funcione con frames
        http.headers(headers -> headers.frameOptions(fo -> fo.disable()));

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(servicioDetallesUsuario);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configuración CORS permisiva para desarrollo local.
     * En producción, limitar los orígenes permitidos.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
