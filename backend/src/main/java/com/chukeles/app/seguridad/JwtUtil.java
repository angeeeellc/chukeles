package com.chukeles.app.seguridad;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Utilidad para generar y validar tokens JWT.
 */
@Component
public class JwtUtil {

    @Value("${chukeles.jwt.secreto}")
    private String secreto;

    @Value("${chukeles.jwt.expiracion-ms}")
    private long expiracionMs;

    private SecretKey obtenerClave() {
        return Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8));
    }

    public String generarToken(UserDetails detallesUsuario) {
        Map<String, Object> claims = new HashMap<>();
        return Jwts.builder()
                .claims(claims)
                .subject(detallesUsuario.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiracionMs))
                .signWith(obtenerClave())
                .compact();
    }

    public String extraerEmail(String token) {
        return Jwts.parser()
                .verifyWith(obtenerClave())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean esTokenValido(String token, UserDetails detallesUsuario) {
        final String email = extraerEmail(token);
        return email.equals(detallesUsuario.getUsername()) && !estaExpirado(token);
    }

    private boolean estaExpirado(String token) {
        return Jwts.parser()
                .verifyWith(obtenerClave())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration()
                .before(new Date());
    }
}
