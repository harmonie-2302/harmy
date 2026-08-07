package com.harmysewing.infrastructure.messaging.dto;

import java.util.UUID;

public record ReceiveMessagePayload(
        UUID id,
        String roomId,
        UUID senderId,
        String senderName,
        String content,
        String timestamp
) {}
