package com.harmysewing.infrastructure.persistence.adapters;

import com.harmysewing.application.ports.out.AtelierRepositoryPort;
import com.harmysewing.domain.models.Atelier;
import com.harmysewing.infrastructure.persistence.entities.AtelierJpaEntity;
import com.harmysewing.infrastructure.persistence.mappers.AtelierPersistenceMapper;
import com.harmysewing.infrastructure.persistence.repositories.AtelierSpringDataRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class AtelierPersistenceAdapter implements AtelierRepositoryPort {

    private final AtelierSpringDataRepository atelierSpringDataRepository;

    public AtelierPersistenceAdapter(AtelierSpringDataRepository atelierSpringDataRepository) {
        this.atelierSpringDataRepository = atelierSpringDataRepository;
    }

    @Override
    public Atelier save(Atelier atelier) {
        AtelierJpaEntity entity = AtelierPersistenceMapper.toJpaEntity(atelier);
        AtelierJpaEntity savedEntity = atelierSpringDataRepository.save(entity);
        return AtelierPersistenceMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Atelier> findById(UUID id) {
        return atelierSpringDataRepository.findById(id)
                .map(AtelierPersistenceMapper::toDomain);
    }

    @Override
    public Optional<Atelier> findByCouturiereId(UUID couturiereId) {
        return atelierSpringDataRepository.findByCouturiereId(couturiereId)
                .map(AtelierPersistenceMapper::toDomain);
    }
}
