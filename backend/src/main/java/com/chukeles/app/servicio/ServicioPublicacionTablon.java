package com.chukeles.app.servicio;

import com.chukeles.app.excepcion.RecursoNoEncontradoException;
import com.chukeles.app.modelo.PublicacionTablon;
import com.chukeles.app.modelo.Rol;
import com.chukeles.app.modelo.TipoPublicacion;
import com.chukeles.app.modelo.Usuario;
import com.chukeles.app.repositorio.RepositorioPublicacionTablon;
import com.chukeles.app.repositorio.RepositorioUsuario;
import com.chukeles.app.transferencia.PeticionPublicacion;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Servicio para gestionar las publicaciones del tablón de anuncios.
 *
 * Reglas de eliminación:
 *  - El autor de la publicación puede borrarla.
 *  - Un administrador puede borrar cualquier publicación.
 */
@Service
@RequiredArgsConstructor
public class ServicioPublicacionTablon {

    private final RepositorioPublicacionTablon repositorioPublicacionTablon;
    private final RepositorioUsuario repositorioUsuario;

    /** Devuelve todas las publicaciones, opcionalmente filtradas por tipo */
    public List<PublicacionTablon> obtenerTodos(TipoPublicacion tipo) {
        if (tipo != null) {
            return repositorioPublicacionTablon.findByTipoOrderByCreadoEnDesc(tipo);
        }
        return repositorioPublicacionTablon.findByOrderByCreadoEnDesc();
    }

    /** Devuelve una publicación por id */
    public PublicacionTablon obtenerPorId(Long id) {
        return repositorioPublicacionTablon.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Publicación no encontrada con id: " + id));
    }

    /**
     * Crea una nueva publicación asociada al usuario autenticado.
     * @param peticion  datos del formulario
     * @param emailAutor email del usuario obtenido del JWT
     */
    public PublicacionTablon crear(PeticionPublicacion peticion, String emailAutor) {
        Usuario autor = repositorioUsuario.findByEmail(emailAutor)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Usuario no encontrado: " + emailAutor));

        PublicacionTablon pub = PublicacionTablon.builder()
                .titulo(peticion.getTitulo())
                .contenido(peticion.getContenido())
                .tipo(peticion.getTipo())
                .fotoUrl(peticion.getFotoUrl())
                .infoContacto(peticion.getInfoContacto())
                .usuario(autor)
                .build();

        return repositorioPublicacionTablon.save(pub);
    }

    /**
     * Elimina una publicación si el solicitante es el autor o un administrador.
     * @param id         id de la publicación
     * @param emailSolicitante email del usuario que pide el borrado
     */
    public void eliminar(Long id, String emailSolicitante) {
        PublicacionTablon pub = repositorioPublicacionTablon.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Publicación no encontrada con id: " + id));

        Usuario solicitante = repositorioUsuario.findByEmail(emailSolicitante)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Usuario no encontrado: " + emailSolicitante));

        boolean esAutor = pub.getUsuario() != null
                && pub.getUsuario().getId().equals(solicitante.getId());
        boolean esAdmin = solicitante.getRol() == Rol.ROL_ADMIN;

        if (!esAutor && !esAdmin) {
            throw new AccessDeniedException(
                    "No tienes permiso para eliminar esta publicación.");
        }

        repositorioPublicacionTablon.deleteById(id);
    }
}
