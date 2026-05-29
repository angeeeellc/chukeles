package com.chukeles.app.repositorio;

import com.chukeles.app.modelo.Evento;
import com.chukeles.app.modelo.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface RepositorioEvento extends JpaRepository<Evento, Long> {
    List<Evento> findByOrderByFechaAsc();
    List<Evento> findByFechaGreaterThanEqualOrderByFechaAsc(LocalDate hoy);
    List<Evento> findByParticipantesContaining(Usuario usuario);
}
