package com.harmysewing.application.ports.out;

import com.harmysewing.domain.models.PartageCarnet;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PartageCarnetRepositoryPort {
    PartageCarnet save(PartageCarnet partageCarnet);
    Optional<PartageCarnet> findByCarnetMesureIdAndCouturiereId(UUID carnetMesureId, UUID couturiereId);
    boolean existsByCarnetMesureIdAndCouturiereId(UUID carnetMesureId, UUID couturiereId);
    List<PartageCarnet> findByCarnetMesureId(UUID carnetMesureId);
    List<PartageCarnet> findByCouturiereId(UUID couturiereId);
    void deleteByCarnetMesureIdAndCouturiereId(UUID carnetMesureId, UUID couturiereId);
}
