package com.harmysewing.infrastructure.persistence.repositories;

import com.harmysewing.infrastructure.persistence.entities.TaskJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskSpringDataRepository extends JpaRepository<TaskJpaEntity, UUID> {
    List<TaskJpaEntity> findByAtelierId(UUID atelierId);
}
