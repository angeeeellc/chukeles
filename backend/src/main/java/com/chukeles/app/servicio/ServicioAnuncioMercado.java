package com.chukeles.app.servicio;

import com.chukeles.app.excepcion.RecursoNoEncontradoException;
import com.chukeles.app.modelo.AnuncioMercado;
import com.chukeles.app.modelo.CategoriaMercado;
import com.chukeles.app.modelo.Rol;
import com.chukeles.app.modelo.Usuario;
import com.chukeles.app.repositorio.RepositorioAnuncioMercado;
import com.chukeles.app.repositorio.RepositorioUsuario;
import com.chukeles.app.transferencia.PeticionAnuncioMercado;
import com.chukeles.app.transferencia.RespuestaAnuncioMercado;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Servicio para gestionar los anuncios del marketplace (tienda).
 *
 * Reglas de acceso:
 *  - Listar y ver detalle: público
 *  - Crear: usuario autenticado
 *  - Marcar vendido / eliminar: autor del anuncio o admin
 */
@Service
@RequiredArgsConstructor
public class ServicioAnuncioMercado {

    private final RepositorioAnuncioMercado repositorioAnuncioMercado;
    private final RepositorioUsuario repositorioUsuario;

    /** Lista todos los anuncios, con filtro opcional por categoría y/o estado. */
    public List<RespuestaAnuncioMercado> obtenerTodos(String categoria, String estado) {
        List<AnuncioMercado> lista;

        CategoriaMercado cat = null;
        if (categoria != null && !categoria.isBlank()) {
            try {
                cat = CategoriaMercado.valueOf(categoria.toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // Categoría inválida → se ignora el filtro
            }
        }

        if (cat != null && estado != null && !estado.isBlank()) {
            lista = repositorioAnuncioMercado.findByCategoriaAndEstado(cat, estado.toUpperCase());
        } else if (cat != null) {
            lista = repositorioAnuncioMercado.findByCategoria(cat);
        } else if (estado != null && !estado.isBlank()) {
            lista = repositorioAnuncioMercado.findByEstado(estado.toUpperCase());
        } else {
            lista = repositorioAnuncioMercado.findAll();
        }

        return lista.stream().map(RespuestaAnuncioMercado::desde).toList();
    }

    /** Obtiene el detalle de un anuncio por id. */
    public RespuestaAnuncioMercado obtenerPorId(Long id) {
        AnuncioMercado anuncio = repositorioAnuncioMercado.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Anuncio no encontrado con id: " + id));
        return RespuestaAnuncioMercado.desde(anuncio);
    }

    /** Crea un nuevo anuncio ligado al usuario autenticado. */
    public RespuestaAnuncioMercado crear(PeticionAnuncioMercado peticion, String emailUsuario) {
        Usuario usuario = repositorioUsuario.findByEmail(emailUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado: " + emailUsuario));

        AnuncioMercado anuncio = AnuncioMercado.builder()
                .titulo(peticion.getTitulo())
                .precio(peticion.getPrecio())
                .descripcion(peticion.getDescripcion())
                .fotoUrl(peticion.getFotoUrl())
                .categoria(peticion.getCategoria())
                .infoContacto(peticion.getInfoContacto())
                .estado("DISPONIBLE")
                .usuario(usuario)
                .build();

        return RespuestaAnuncioMercado.desde(repositorioAnuncioMercado.save(anuncio));
    }

    /** Actualiza un anuncio existente. Solo autor o admin. */
    public RespuestaAnuncioMercado actualizar(Long id, PeticionAnuncioMercado peticion, String emailUsuario) {
        AnuncioMercado anuncio = repositorioAnuncioMercado.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Anuncio no encontrado con id: " + id));

        validarAutorOAdmin(anuncio, emailUsuario);

        anuncio.setTitulo(peticion.getTitulo());
        anuncio.setPrecio(peticion.getPrecio());
        anuncio.setDescripcion(peticion.getDescripcion());
        anuncio.setFotoUrl(peticion.getFotoUrl());
        anuncio.setCategoria(peticion.getCategoria());
        anuncio.setInfoContacto(peticion.getInfoContacto());

        return RespuestaAnuncioMercado.desde(repositorioAnuncioMercado.save(anuncio));
    }

    /** Actualiza el estado del anuncio (DISPONIBLE / VENDIDO). Solo el autor o un admin. */
    public RespuestaAnuncioMercado actualizarEstado(Long id, String nuevoEstado, String emailUsuario) {
        AnuncioMercado anuncio = repositorioAnuncioMercado.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Anuncio no encontrado con id: " + id));

        validarAutorOAdmin(anuncio, emailUsuario);
        anuncio.setEstado(nuevoEstado.toUpperCase());
        return RespuestaAnuncioMercado.desde(repositorioAnuncioMercado.save(anuncio));
    }

    /** Elimina un anuncio. Solo el autor o un admin. */
    public void eliminar(Long id, String emailUsuario) {
        AnuncioMercado anuncio = repositorioAnuncioMercado.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Anuncio no encontrado con id: " + id));

        validarAutorOAdmin(anuncio, emailUsuario);
        repositorioAnuncioMercado.deleteById(id);
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private void validarAutorOAdmin(AnuncioMercado anuncio, String emailUsuario) {
        Usuario usuario = repositorioUsuario.findByEmail(emailUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado: " + emailUsuario));

        boolean esAdmin = usuario.getRol() == Rol.ROL_ADMIN;
        boolean esAutor = anuncio.getUsuario() != null
                && anuncio.getUsuario().getId().equals(usuario.getId());

        if (!esAdmin && !esAutor) {
            throw new AccessDeniedException("No tienes permiso para modificar este anuncio.");
        }
    }
}

