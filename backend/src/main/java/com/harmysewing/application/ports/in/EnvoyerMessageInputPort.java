package com.harmysewing.application.ports.in;

import com.harmysewing.domain.models.Message;

import java.util.UUID;

public interface EnvoyerMessageInputPort {

    record Command(
            String roomId,
            UUID expediteurId,
            String contenu
    ) {}

    Message executer(Command command);
}
