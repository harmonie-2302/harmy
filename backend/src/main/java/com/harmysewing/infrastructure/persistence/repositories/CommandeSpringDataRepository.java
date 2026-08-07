package com.harmysewing.infrastructure.persistence.repositories;

import com.harmysewing.infrastructure.persistence.entities.CommandeJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommandeSpringDataRepository extends JpaRepository<CommandeJpaEntity, UUID> {
    List<CommandeJpaEntity> findByAtelierId(UUID atelierId);
    List<CommandeJpaEntity> findByClientId(UUID clientId);
}
