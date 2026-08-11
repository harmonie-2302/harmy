package com.harmysewing.infrastructure.persistence.repositories;

import com.harmysewing.infrastructure.persistence.entities.PartageCarnetJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PartageCarnetSpringDataRepository extends JpaRepository<PartageCarnetJpaEntity, UUID> {
    Optional<PartageCarnetJpaEntity> findByCarnetMesureIdAndCouturiereId(UUID carnetMesureId, UUID couturiereId);
    boolean existsByCarnetMesureIdAndCouturiereId(UUID carnetMesureId, UUID couturiereId);
    List<PartageCarnetJpaEntity> findByCarnetMesureId(UUID carnetMesureId);
    void deleteByCarnetMesureIdAndCouturiereId(UUID carnetMesureId, UUID couturiereId);
}
