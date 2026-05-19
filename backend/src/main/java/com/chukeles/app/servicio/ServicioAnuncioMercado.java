package com.chukeles.app.servicio;

import com.chukeles.app.excepcion.RecursoNoEncontradoException;
import com.chukeles.app.modelo.AnuncioMercado;
import com.chukeles.app.repositorio.RepositorioAnuncioMercado;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Servicio para gestionar los anuncios del marketplace (tienda).
 */
@Service
@RequiredArgsConstructor
public class ServicioAnuncioMercado {

    private final RepositorioAnuncioMercado repositorioAnuncioMercado;

    public List<AnuncioMercado> obtenerTodos() {
        return repositorioAnuncioMercado.findAll();
    }

    public void eliminar(Long id) {
        if (!repositorioAnuncioMercado.existsById(id)) {
            throw new RecursoNoEncontradoException("Anuncio de mercado no encontrado con id: " + id);
        }
        repositorioAnuncioMercado.deleteById(id);
    }
}
