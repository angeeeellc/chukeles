package com.chukeles.app.repositorio;

import com.chukeles.app.modelo.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RepositorioEvento extends JpaRepository<Evento, Long> {
    List<Evento> findByOrderByFechaAsc();
}
