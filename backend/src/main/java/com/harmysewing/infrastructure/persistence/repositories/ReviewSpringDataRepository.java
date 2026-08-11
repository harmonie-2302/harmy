package com.harmysewing.infrastructure.persistence.repositories;

import com.harmysewing.infrastructure.persistence.entities.ReviewJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewSpringDataRepository extends JpaRepository<ReviewJpaEntity, UUID> {
    List<ReviewJpaEntity> findByAtelierId(UUID atelierId);
}
