package com.harmysewing.application.ports.out;

import com.harmysewing.domain.models.Message;

import java.util.List;
import java.util.UUID;

public interface MessageRepositoryPort {

    Message save(Message message);

    List<Message> findByRoomId(String roomId);

    /** Tous les messages des salons auxquels participe l'utilisateur. */
    List<Message> findByParticipant(UUID userId);
}
