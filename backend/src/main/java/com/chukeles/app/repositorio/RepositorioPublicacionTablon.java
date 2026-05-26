package com.chukeles.app.repositorio;

import com.chukeles.app.modelo.PublicacionTablon;
import com.chukeles.app.modelo.TipoPublicacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RepositorioPublicacionTablon extends JpaRepository<PublicacionTablon, Long> {
    List<PublicacionTablon> findByOrderByCreadoEnDesc();
    List<PublicacionTablon> findByTipoOrderByCreadoEnDesc(TipoPublicacion tipo);
}
