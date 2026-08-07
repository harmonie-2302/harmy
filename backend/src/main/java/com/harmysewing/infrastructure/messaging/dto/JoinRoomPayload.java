package com.harmysewing.infrastructure.messaging.dto;

import java.util.UUID;

public record JoinRoomPayload(
        String roomId,
        UUID userId
) {}
