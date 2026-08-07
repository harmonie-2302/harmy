package com.harmysewing.infrastructure.persistence.adapters;

import com.harmysewing.application.ports.out.PartageCarnetRepositoryPort;
import com.harmysewing.domain.models.PartageCarnet;
import com.harmysewing.infrastructure.persistence.entities.PartageCarnetJpaEntity;
import com.harmysewing.infrastructure.persistence.mappers.PartageCarnetPersistenceMapper;
import com.harmysewing.infrastructure.persistence.repositories.PartageCarnetSpringDataRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class PartageCarnetPersistenceAdapter implements PartageCarnetRepositoryPort {

    private final PartageCarnetSpringDataRepository partageCarnetSpringDataRepository;

    public PartageCarnetPersistenceAdapter(PartageCarnetSpringDataRepository partageCarnetSpringDataRepository) {
        this.partageCarnetSpringDataRepository = partageCarnetSpringDataRepository;
    }

    @Override
    public PartageCarnet save(PartageCarnet partageCarnet) {
        PartageCarnetJpaEntity entity = PartageCarnetPersistenceMapper.toJpaEntity(partageCarnet);
        PartageCarnetJpaEntity savedEntity = partageCarnetSpringDataRepository.save(entity);
        return PartageCarnetPersistenceMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<PartageCarnet> findByCarnetMesureIdAndCouturiereId(UUID carnetMesureId, UUID couturiereId) {
        return partageCarnetSpringDataRepository.findByCarnetMesureIdAndCouturiereId(carnetMesureId, couturiereId)
                .map(PartageCarnetPersistenceMapper::toDomain);
    }

    @Override
    public boolean existsByCarnetMesureIdAndCouturiereId(UUID carnetMesureId, UUID couturiereId) {
        return partageCarnetSpringDataRepository.existsByCarnetMesureIdAndCouturiereId(carnetMesureId, couturiereId);
    }
}
