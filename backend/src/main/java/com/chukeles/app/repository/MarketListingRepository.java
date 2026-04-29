package com.chukeles.app.repository;

import com.chukeles.app.model.MarketListing;
import com.chukeles.app.model.MarketCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MarketListingRepository extends JpaRepository<MarketListing, Long> {
    List<MarketListing> findByCategory(MarketCategory category);
    List<MarketListing> findByStatus(String status);
    List<MarketListing> findByCategoryAndStatus(MarketCategory category, String status);
}
