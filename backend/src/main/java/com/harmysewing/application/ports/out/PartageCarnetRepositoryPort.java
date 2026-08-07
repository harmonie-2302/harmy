package com.harmysewing.application.ports.out;

import com.harmysewing.domain.models.PartageCarnet;

import java.util.Optional;
import java.util.UUID;

public interface PartageCarnetRepositoryPort {
    PartageCarnet save(PartageCarnet partageCarnet);
    Optional<PartageCarnet> findByCarnetMesureIdAndCouturiereId(UUID carnetMesureId, UUID couturiereId);
    boolean existsByCarnetMesureIdAndCouturiereId(UUID carnetMesureId, UUID couturiereId);
}
