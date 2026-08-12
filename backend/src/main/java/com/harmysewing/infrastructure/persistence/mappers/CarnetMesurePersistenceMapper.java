package com.harmysewing.infrastructure.persistence.mappers;

import com.harmysewing.domain.models.CarnetMesure;
import com.harmysewing.infrastructure.persistence.entities.CarnetMesureJpaEntity;

public class CarnetMesurePersistenceMapper {

    public static CarnetMesure toDomain(CarnetMesureJpaEntity entity) {
        if (entity == null) {
            return null;
        }
        return new CarnetMesure(
                entity.getId(),
                entity.getNomClient(),
                UserPersistenceMapper.toDomain(entity.getCliente()),
                UserPersistenceMapper.toDomain(entity.getCouturiere()),
                entity.isEstLocal(),
                entity.getMesures(),
                entity.getDateCreation(),
                entity.getDateModification(),
                entity.getCustomerId()
        );
    }

    public static CarnetMesureJpaEntity toJpaEntity(CarnetMesure domain) {
        if (domain == null) {
            return null;
        }
        return new CarnetMesureJpaEntity(
                domain.getId(),
                domain.getNomClient(),
                UserPersistenceMapper.toJpaEntity(domain.getCliente()),
                UserPersistenceMapper.toJpaEntity(domain.getCouturiere()),
                domain.isEstLocal(),
                domain.getMesures(),
                domain.getDateCreation(),
                domain.getDateModification(),
                domain.getCustomerId()
        );
    }
}
