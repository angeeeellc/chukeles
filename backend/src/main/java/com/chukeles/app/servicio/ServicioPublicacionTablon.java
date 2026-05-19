package com.chukeles.app.servicio;

import com.chukeles.app.excepcion.RecursoNoEncontradoException;
import com.chukeles.app.modelo.PublicacionTablon;
import com.chukeles.app.repositorio.RepositorioPublicacionTablon;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Servicio para gestionar las publicaciones del tablón de anuncios.
 */
@Service
@RequiredArgsConstructor
public class ServicioPublicacionTablon {

    private final RepositorioPublicacionTablon repositorioPublicacionTablon;

    public List<PublicacionTablon> obtenerTodos() {
        return repositorioPublicacionTablon.findByOrderByCreadoEnDesc();
    }

    public void eliminar(Long id) {
        if (!repositorioPublicacionTablon.existsById(id)) {
            throw new RecursoNoEncontradoException("Publicación de tablón no encontrada con id: " + id);
        }
        repositorioPublicacionTablon.deleteById(id);
    }
}
