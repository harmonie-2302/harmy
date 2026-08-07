package com.harmysewing.infrastructure.persistence.repositories;

import com.harmysewing.infrastructure.persistence.entities.CarnetMesureJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CarnetMesureSpringDataRepository extends JpaRepository<CarnetMesureJpaEntity, UUID> {
    List<CarnetMesureJpaEntity> findByCouturiereId(UUID couturiereId);
    List<CarnetMesureJpaEntity> findByClienteId(UUID clienteId);
}
