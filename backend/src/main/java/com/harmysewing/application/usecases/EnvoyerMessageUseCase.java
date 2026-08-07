package com.harmysewing.application.usecases;

import com.harmysewing.application.ports.in.EnvoyerMessageInputPort;
import com.harmysewing.application.ports.out.MessageRepositoryPort;
import com.harmysewing.application.ports.out.UserRepositoryPort;
import com.harmysewing.domain.exceptions.DomainException;
import com.harmysewing.domain.models.Message;
import com.harmysewing.domain.models.User;

import java.time.LocalDateTime;
import java.util.UUID;

public class EnvoyerMessageUseCase implements EnvoyerMessageInputPort {

    private final MessageRepositoryPort messageRepository;
    private final UserRepositoryPort userRepository;

    public EnvoyerMessageUseCase(MessageRepositoryPort messageRepository, UserRepositoryPort userRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Message executer(Command command) {
        if (command.roomId() == null || command.roomId().isBlank()) {
            throw new DomainException("L'identifiant du salon (roomId) est obligatoire.");
        }
        if (command.contenu() == null || command.contenu().isBlank()) {
            throw new DomainException("Le contenu du message ne peut pas être vide.");
        }

        User expediteur = null;
        if (command.expediteurId() != null) {
            expediteur = userRepository.findById(command.expediteurId())
                    .orElseThrow(() -> new DomainException("Expéditeur introuvable avec l'ID: " + command.expediteurId()));
        }

        Message message = new Message(
                UUID.randomUUID(),
                command.roomId(),
                expediteur,
                command.contenu(),
                LocalDateTime.now()
        );

        return messageRepository.save(message);
    }
}
