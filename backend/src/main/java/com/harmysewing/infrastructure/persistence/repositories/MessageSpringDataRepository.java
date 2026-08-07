package com.harmysewing.infrastructure.persistence.repositories;

import com.harmysewing.infrastructure.persistence.entities.MessageJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageSpringDataRepository extends JpaRepository<MessageJpaEntity, UUID> {
    List<MessageJpaEntity> findByRoomIdOrderByTimestampAsc(String roomId);
}
