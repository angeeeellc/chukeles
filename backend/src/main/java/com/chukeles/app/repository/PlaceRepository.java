package com.chukeles.app.repository;

import com.chukeles.app.model.Place;
import com.chukeles.app.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlaceRepository extends JpaRepository<Place, Long> {
    List<Place> findByCategory(Category category);
    List<Place> findByNameContainingIgnoreCase(String name);
    List<Place> findByCategoryAndNameContainingIgnoreCase(Category category, String name);
}
