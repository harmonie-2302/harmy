package com.harmysewing.application.ports.out;

import com.harmysewing.domain.models.CarnetMesure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CarnetMesureRepositoryPort {
    CarnetMesure save(CarnetMesure carnetMesure);
    Optional<CarnetMesure> findById(UUID id);
    List<CarnetMesure> findByCouturiereId(UUID couturiereId);
    List<CarnetMesure> findByClienteId(UUID clienteId);
    Optional<CarnetMesure> findByCustomerId(UUID customerId);
    List<CarnetMesure> findByIds(List<UUID> ids);
}
