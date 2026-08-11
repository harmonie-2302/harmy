package com.harmysewing.infrastructure.persistence.repositories;

import com.harmysewing.infrastructure.persistence.entities.CustomerJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CustomerSpringDataRepository extends JpaRepository<CustomerJpaEntity, UUID> {
    List<CustomerJpaEntity> findByAtelierId(UUID atelierId);
}
