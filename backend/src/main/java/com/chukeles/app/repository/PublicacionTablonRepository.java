package com.chukeles.app.repository;

import com.chukeles.app.model.PublicacionTablon;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PublicacionTablonRepository extends JpaRepository<PublicacionTablon, Long> {
    List<PublicacionTablon> findByOrderByCreadoEnDesc();
}
