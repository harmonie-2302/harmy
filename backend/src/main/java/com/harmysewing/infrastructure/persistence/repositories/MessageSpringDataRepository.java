package com.harmysewing.infrastructure.persistence.repositories;

import com.harmysewing.infrastructure.persistence.entities.MessageJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageSpringDataRepository extends JpaRepository<MessageJpaEntity, UUID> {

    List<MessageJpaEntity> findByRoomIdOrderByTimestampAsc(String roomId);

    /**
     * L'identifiant de salon encode les deux interlocuteurs
     * ({@code room_<uuidA>_<uuidB>}) : rechercher le fragment permet de
     * retrouver les échanges d'un utilisateur qu'il soit émetteur ou récepteur.
     */
    List<MessageJpaEntity> findByRoomIdContainingOrderByTimestampAsc(String fragment);
}
