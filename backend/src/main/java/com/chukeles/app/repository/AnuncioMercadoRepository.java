package com.chukeles.app.repository;

import com.chukeles.app.model.AnuncioMercado;
import com.chukeles.app.model.CategoriaMercado;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnuncioMercadoRepository extends JpaRepository<AnuncioMercado, Long> {
    List<AnuncioMercado> findByCategoria(CategoriaMercado categoria);
    List<AnuncioMercado> findByEstado(String estado);
    List<AnuncioMercado> findByCategoriaAndEstado(CategoriaMercado categoria, String estado);
}
