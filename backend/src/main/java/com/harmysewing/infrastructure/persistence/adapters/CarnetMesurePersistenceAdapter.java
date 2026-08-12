package com.harmysewing.infrastructure.persistence.adapters;

import com.harmysewing.application.ports.out.CarnetMesureRepositoryPort;
import com.harmysewing.domain.models.CarnetMesure;
import com.harmysewing.infrastructure.persistence.entities.CarnetMesureJpaEntity;
import com.harmysewing.infrastructure.persistence.mappers.CarnetMesurePersistenceMapper;
import com.harmysewing.infrastructure.persistence.repositories.CarnetMesureSpringDataRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class CarnetMesurePersistenceAdapter implements CarnetMesureRepositoryPort {

    private final CarnetMesureSpringDataRepository carnetMesureSpringDataRepository;

    public CarnetMesurePersistenceAdapter(CarnetMesureSpringDataRepository carnetMesureSpringDataRepository) {
        this.carnetMesureSpringDataRepository = carnetMesureSpringDataRepository;
    }

    @Override
    public CarnetMesure save(CarnetMesure carnetMesure) {
        CarnetMesureJpaEntity entity = CarnetMesurePersistenceMapper.toJpaEntity(carnetMesure);
        CarnetMesureJpaEntity savedEntity = carnetMesureSpringDataRepository.save(entity);
        return CarnetMesurePersistenceMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<CarnetMesure> findById(UUID id) {
        return carnetMesureSpringDataRepository.findById(id)
                .map(CarnetMesurePersistenceMapper::toDomain);
    }

    @Override
    public List<CarnetMesure> findByCouturiereId(UUID couturiereId) {
        return carnetMesureSpringDataRepository.findByCouturiereId(couturiereId)
                .stream()
                .map(CarnetMesurePersistenceMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<CarnetMesure> findByClienteId(UUID clienteId) {
        return carnetMesureSpringDataRepository.findByClienteId(clienteId)
                .stream()
                .map(CarnetMesurePersistenceMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<CarnetMesure> findByCustomerId(UUID customerId) {
        return carnetMesureSpringDataRepository.findByCustomerId(customerId)
                .map(CarnetMesurePersistenceMapper::toDomain);
    }

    @Override
    public List<CarnetMesure> findByIds(List<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return carnetMesureSpringDataRepository.findAllById(ids)
                .stream()
                .map(CarnetMesurePersistenceMapper::toDomain)
                .collect(Collectors.toList());
    }
}
