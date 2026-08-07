package com.harmysewing.application.ports.out;

import com.harmysewing.domain.models.Atelier;

import java.util.Optional;
import java.util.UUID;

public interface AtelierRepositoryPort {
    Atelier save(Atelier atelier);
    Optional<Atelier> findById(UUID id);
    Optional<Atelier> findByCouturiereId(UUID couturiereId);
}
