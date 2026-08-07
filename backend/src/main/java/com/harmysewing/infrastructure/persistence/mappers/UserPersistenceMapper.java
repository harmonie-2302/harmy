package com.harmysewing.infrastructure.persistence.mappers;

import com.harmysewing.domain.models.User;
import com.harmysewing.infrastructure.persistence.entities.UserJpaEntity;

public class UserPersistenceMapper {

    public static User toDomain(UserJpaEntity entity) {
        if (entity == null) {
            return null;
        }
        return new User(
                entity.getId(),
                entity.getNom(),
                entity.getPrenom(),
                entity.getEmail(),
                entity.getMotDePasse(),
                entity.getRole(),
                entity.getTelephone(),
                entity.getDateCreation()
        );
    }

    public static UserJpaEntity toJpaEntity(User domain) {
        if (domain == null) {
            return null;
        }
        return new UserJpaEntity(
                domain.getId(),
                domain.getNom(),
                domain.getPrenom(),
                domain.getEmail(),
                domain.getMotDePasse(),
                domain.getRole(),
                domain.getTelephone(),
                domain.getDateCreation()
        );
    }
}
