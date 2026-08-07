package com.harmysewing.infrastructure.messaging.dto;

import java.util.UUID;

public record SendMessagePayload(
        String roomId,
        UUID senderId,
        String content
) {}
