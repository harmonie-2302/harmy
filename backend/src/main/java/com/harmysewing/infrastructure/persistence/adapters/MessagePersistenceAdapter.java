package com.harmysewing.infrastructure.persistence.adapters;

import com.harmysewing.application.ports.out.MessageRepositoryPort;
import com.harmysewing.domain.models.Message;
import com.harmysewing.infrastructure.persistence.entities.MessageJpaEntity;
import com.harmysewing.infrastructure.persistence.mappers.MessagePersistenceMapper;
import com.harmysewing.infrastructure.persistence.repositories.MessageSpringDataRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class MessagePersistenceAdapter implements MessageRepositoryPort {

    private final MessageSpringDataRepository messageSpringDataRepository;

    public MessagePersistenceAdapter(MessageSpringDataRepository messageSpringDataRepository) {
        this.messageSpringDataRepository = messageSpringDataRepository;
    }

    @Override
    public Message save(Message message) {
        MessageJpaEntity entity = MessagePersistenceMapper.toJpaEntity(message);
        MessageJpaEntity savedEntity = messageSpringDataRepository.save(entity);
        return MessagePersistenceMapper.toDomain(savedEntity);
    }

    @Override
    public List<Message> findByRoomId(String roomId) {
        return messageSpringDataRepository.findByRoomIdOrderByTimestampAsc(roomId)
                .stream()
                .map(MessagePersistenceMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Message> findByParticipant(UUID userId) {
        if (userId == null) {
            return List.of();
        }
        return messageSpringDataRepository
                .findByRoomIdContainingOrderByTimestampAsc(userId.toString())
                .stream()
                .map(MessagePersistenceMapper::toDomain)
                .collect(Collectors.toList());
    }
}
