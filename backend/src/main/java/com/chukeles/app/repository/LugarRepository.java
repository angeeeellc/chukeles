package com.chukeles.app.repository;

import com.chukeles.app.model.Lugar;
import com.chukeles.app.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LugarRepository extends JpaRepository<Lugar, Long> {
    List<Lugar> findByCategoria(Categoria categoria);
    List<Lugar> findByNombreContainingIgnoreCase(String nombre);
    List<Lugar> findByCategoriaAndNombreContainingIgnoreCase(Categoria categoria, String nombre);
}
