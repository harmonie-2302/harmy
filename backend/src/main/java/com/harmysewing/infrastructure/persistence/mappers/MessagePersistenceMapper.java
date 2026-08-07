package com.harmysewing.infrastructure.persistence.mappers;

import com.harmysewing.domain.models.Message;
import com.harmysewing.infrastructure.persistence.entities.MessageJpaEntity;

public class MessagePersistenceMapper {

    public static Message toDomain(MessageJpaEntity entity) {
        if (entity == null) {
            return null;
        }
        return new Message(
                entity.getId(),
                entity.getRoomId(),
                UserPersistenceMapper.toDomain(entity.getExpediteur()),
                entity.getContenu(),
                entity.getTimestamp()
        );
    }

    public static MessageJpaEntity toJpaEntity(Message domain) {
        if (domain == null) {
            return null;
        }
        return new MessageJpaEntity(
                domain.getId(),
                domain.getRoomId(),
                UserPersistenceMapper.toJpaEntity(domain.getExpediteur()),
                domain.getContenu(),
                domain.getTimestamp()
        );
    }
}
