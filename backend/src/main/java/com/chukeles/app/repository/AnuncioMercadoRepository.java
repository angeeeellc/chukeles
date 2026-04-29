package com.chukeles.app.repository;

import com.chukeles.app.model.AnuncioMercado;
import com.chukeles.app.model.CategoriaMercado;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnuncioMercadoRepository extends JpaRepository<AnuncioMercado, Long> {
    List<AnuncioMercado> findByCategory(CategoriaMercado categoria);
    List<AnuncioMercado> findByStatus(String estado);
    List<AnuncioMercado> findByCategoryAndStatus(CategoriaMercado categoria, String estado);
}
