package com.chukeles.app.repository;

import com.chukeles.app.model.Lugar;
import com.chukeles.app.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LugarRepository extends JpaRepository<Lugar, Long> {
    List<Lugar> findByCategory(Categoria categoria);
    List<Lugar> findByNameContainingIgnoreCase(String nombre);
    List<Lugar> findByCategoryAndNameContainingIgnoreCase(Categoria categoria, String nombre);
}
