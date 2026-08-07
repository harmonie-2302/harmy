package com.harmysewing.infrastructure.persistence.repositories;

import com.harmysewing.infrastructure.persistence.entities.AtelierJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AtelierSpringDataRepository extends JpaRepository<AtelierJpaEntity, UUID> {
    Optional<AtelierJpaEntity> findByCouturiereId(UUID couturiereId);
}
