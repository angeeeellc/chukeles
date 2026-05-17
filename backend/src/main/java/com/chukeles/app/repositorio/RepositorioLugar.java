package com.chukeles.app.repositorio;

import com.chukeles.app.modelo.Lugar;
import com.chukeles.app.modelo.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RepositorioLugar extends JpaRepository<Lugar, Long> {
    List<Lugar> findByCategoria(Categoria categoria);
    List<Lugar> findByNombreContainingIgnoreCase(String nombre);
    List<Lugar> findByCategoriaAndNombreContainingIgnoreCase(Categoria categoria, String nombre);
}
