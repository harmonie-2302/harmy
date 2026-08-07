package com.harmysewing.infrastructure.persistence.mappers;

import com.harmysewing.domain.models.PartageCarnet;
import com.harmysewing.infrastructure.persistence.entities.PartageCarnetJpaEntity;

public class PartageCarnetPersistenceMapper {

    public static PartageCarnet toDomain(PartageCarnetJpaEntity entity) {
        if (entity == null) {
            return null;
        }
        return new PartageCarnet(
                entity.getId(),
                entity.getCarnetMesureId(),
                entity.getCouturiereId(),
                entity.getDatePartage()
        );
    }

    public static PartageCarnetJpaEntity toJpaEntity(PartageCarnet domain) {
        if (domain == null) {
            return null;
        }
        return new PartageCarnetJpaEntity(
                domain.getId(),
                domain.getCarnetMesureId(),
                domain.getCouturiereId(),
                domain.getDatePartage()
        );
    }
}
