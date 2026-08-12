package com.harmysewing.infrastructure.persistence.mappers;

import com.harmysewing.domain.models.Atelier;
import com.harmysewing.infrastructure.persistence.entities.AtelierJpaEntity;

public class AtelierPersistenceMapper {

    public static Atelier toDomain(AtelierJpaEntity entity) {
        if (entity == null) {
            return null;
        }
        return new Atelier(
                entity.getId(),
                entity.getNom(),
                entity.getDescription(),
                entity.getAdresse(),
                entity.getTelephone(),
                UserPersistenceMapper.toDomain(entity.getCouturiere()),
                entity.getDateCreation(),
                entity.getVille(),
                entity.getPays(),
                entity.getPricing(),
                entity.getPortfolioCoverUrl()
        );
    }

    public static AtelierJpaEntity toJpaEntity(Atelier domain) {
        if (domain == null) {
            return null;
        }
        return new AtelierJpaEntity(
                domain.getId(),
                domain.getNom(),
                domain.getDescription(),
                domain.getAdresse(),
                domain.getTelephone(),
                UserPersistenceMapper.toJpaEntity(domain.getCouturiere()),
                domain.getDateCreation(),
                domain.getVille(),
                domain.getPays(),
                domain.getPricing(),
                domain.getPortfolioCoverUrl()
        );
    }
}
