package com.chukeles.app.repository;

import com.chukeles.app.model.BulletinPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BulletinPostRepository extends JpaRepository<BulletinPost, Long> {
    List<BulletinPost> findByOrderByCreatedAtDesc();
}
