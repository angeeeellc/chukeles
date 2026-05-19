package com.chukeles.app.servicio;

import com.chukeles.app.excepcion.RecursoNoEncontradoException;
import com.chukeles.app.modelo.Evento;
import com.chukeles.app.repositorio.RepositorioEvento;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Servicio para gestionar los eventos (quedadas).
 */
@Service
@RequiredArgsConstructor
public class ServicioEvento {

    private final RepositorioEvento repositorioEvento;

    public List<Evento> obtenerTodos() {
        return repositorioEvento.findByOrderByFechaAsc();
    }

    public void eliminar(Long id) {
        if (!repositorioEvento.existsById(id)) {
            throw new RecursoNoEncontradoException("Evento no encontrado con id: " + id);
        }
        repositorioEvento.deleteById(id);
    }
}
