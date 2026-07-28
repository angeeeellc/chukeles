package com.chukeles.app.repositorio;

import com.chukeles.app.modelo.Lugar;
import com.chukeles.app.modelo.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RepositorioLugar extends JpaRepository<Lugar, Long> {
    List<Lugar> findByAprobadoTrue();
    List<Lugar> findByCategoriaAndAprobadoTrue(Categoria categoria);
    List<Lugar> findByNombreContainingIgnoreCaseAndAprobadoTrue(String nombre);
    List<Lugar> findByCategoriaAndNombreContainingIgnoreCaseAndAprobadoTrue(Categoria categoria, String nombre);
}
