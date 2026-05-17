package com.chukeles.app.repositorio;

import com.chukeles.app.modelo.AnuncioMercado;
import com.chukeles.app.modelo.CategoriaMercado;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RepositorioAnuncioMercado extends JpaRepository<AnuncioMercado, Long> {
    List<AnuncioMercado> findByCategoria(CategoriaMercado categoria);
    List<AnuncioMercado> findByEstado(String estado);
    List<AnuncioMercado> findByCategoriaAndEstado(CategoriaMercado categoria, String estado);
}
