package com.chukeles.app.servicio;

import com.chukeles.app.excepcion.RecursoNoEncontradoException;
import com.chukeles.app.modelo.Evento;
import com.chukeles.app.modelo.Rol;
import com.chukeles.app.modelo.Usuario;
import com.chukeles.app.repositorio.RepositorioEvento;
import com.chukeles.app.repositorio.RepositorioUsuario;
import com.chukeles.app.transferencia.PeticionEvento;
import com.chukeles.app.transferencia.RespuestaEvento;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Servicio para gestionar las quedadas caninas (eventos).
 *
 * Reglas de acceso:
 *  - Listar y ver detalle: público (estaApuntado siempre false si no hay usuario)
 *  - Crear: usuario autenticado
 *  - Unirse / salir: usuario autenticado
 *  - Eliminar: autor o admin
 */
@Service
@RequiredArgsConstructor
public class ServicioEvento {

    private final RepositorioEvento repositorioEvento;
    private final RepositorioUsuario repositorioUsuario;

    /** Lista solo los eventos futuros (hoy inclusive), ordenados por fecha asc. */
    public List<RespuestaEvento> obtenerTodos(String emailUsuario) {
        Usuario usuario = resolverUsuario(emailUsuario);
        return repositorioEvento
                .findByFechaGreaterThanEqualOrderByFechaAsc(LocalDate.now())
                .stream()
                .map(e -> RespuestaEvento.desde(e, usuario))
                .toList();
    }

    /** Obtiene el detalle de un evento. */
    public RespuestaEvento obtenerPorId(Long id, String emailUsuario) {
        Evento evento = buscarPorId(id);
        Usuario usuario = resolverUsuario(emailUsuario);
        return RespuestaEvento.desde(evento, usuario);
    }

    /** Crea un nuevo evento ligado al usuario autenticado. */
    @Transactional
    public RespuestaEvento crear(PeticionEvento peticion, String emailUsuario) {
        Usuario usuario = resolverUsuarioPorEmail(emailUsuario);

        Evento evento = Evento.builder()
                .titulo(peticion.getTitulo())
                .fecha(peticion.getFecha())
                .hora(peticion.getHora())
                .ubicacion(peticion.getUbicacion())
                .lat(peticion.getLat())
                .lng(peticion.getLng())
                .maxParticipantes(peticion.getMaxParticipantes())
                .descripcion(peticion.getDescripcion())
                .usuario(usuario)
                .build();

        return RespuestaEvento.desde(repositorioEvento.save(evento), usuario);
    }

    /** Actualiza un evento existente. Solo autor o admin. */
    @Transactional
    public RespuestaEvento actualizar(Long id, PeticionEvento peticion, String emailUsuario) {
        Evento evento = buscarPorId(id);
        validarAutorOAdmin(evento, emailUsuario);

        evento.setTitulo(peticion.getTitulo());
        evento.setFecha(peticion.getFecha());
        evento.setHora(peticion.getHora());
        evento.setUbicacion(peticion.getUbicacion());
        evento.setLat(peticion.getLat());
        evento.setLng(peticion.getLng());
        evento.setMaxParticipantes(peticion.getMaxParticipantes());
        evento.setDescripcion(peticion.getDescripcion());

        return RespuestaEvento.desde(repositorioEvento.save(evento), resolverUsuarioPorEmail(emailUsuario));
    }

    /** Apunta al usuario autenticado al evento. Valida aforo máximo. */
    @Transactional
    public RespuestaEvento unirse(Long id, String emailUsuario) {
        Evento evento = buscarPorId(id);
        Usuario usuario = resolverUsuarioPorEmail(emailUsuario);

        if (evento.getParticipantes().contains(usuario)) {
            throw new IllegalStateException("Ya estás apuntado a esta quedada.");
        }

        if (evento.getMaxParticipantes() != null
                && evento.getParticipantes().size() >= evento.getMaxParticipantes()) {
            throw new IllegalStateException("El aforo máximo de esta quedada ya está completo.");
        }

        evento.getParticipantes().add(usuario);
        return RespuestaEvento.desde(repositorioEvento.save(evento), usuario);
    }

    /** Desapunta al usuario autenticado del evento. */
    @Transactional
    public RespuestaEvento salir(Long id, String emailUsuario) {
        Evento evento = buscarPorId(id);
        Usuario usuario = resolverUsuarioPorEmail(emailUsuario);

        if (!evento.getParticipantes().contains(usuario)) {
            throw new IllegalStateException("No estás apuntado a esta quedada.");
        }

        evento.getParticipantes().remove(usuario);
        return RespuestaEvento.desde(repositorioEvento.save(evento), usuario);
    }

    /** Elimina un evento. Solo el autor o un admin. */
    @Transactional
    public void eliminar(Long id, String emailUsuario) {
        Evento evento = buscarPorId(id);
        validarAutorOAdmin(evento, emailUsuario);
        repositorioEvento.deleteById(id);
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private Evento buscarPorId(Long id) {
        return repositorioEvento.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Evento no encontrado con id: " + id));
    }

    private Usuario resolverUsuario(String email) {
        if (email == null || email.isBlank()) return null;
        return repositorioUsuario.findByEmail(email).orElse(null);
    }

    private Usuario resolverUsuarioPorEmail(String email) {
        return repositorioUsuario.findByEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado: " + email));
    }

    private void validarAutorOAdmin(Evento evento, String emailUsuario) {
        Usuario usuario = resolverUsuarioPorEmail(emailUsuario);
        boolean esAdmin = usuario.getRol() == Rol.ROL_ADMIN;
        boolean esAutor = evento.getUsuario() != null
                && evento.getUsuario().getId().equals(usuario.getId());

        if (!esAdmin && !esAutor) {
            throw new AccessDeniedException("No tienes permiso para eliminar esta quedada.");
        }
    }
}

