package com.harmysewing.infrastructure.messaging;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.DataListener;
import com.harmysewing.application.ports.in.EnvoyerMessageInputPort;
import com.harmysewing.domain.models.Message;
import com.harmysewing.infrastructure.messaging.dto.JoinRoomPayload;
import com.harmysewing.infrastructure.messaging.dto.ReceiveMessagePayload;
import com.harmysewing.infrastructure.messaging.dto.SendMessagePayload;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;

@Component
public class SocketModule {

    private final SocketIOServer server;
    private final EnvoyerMessageInputPort envoyerMessageInputPort;

    public SocketModule(SocketIOServer server, EnvoyerMessageInputPort envoyerMessageInputPort) {
        this.server = server;
        this.envoyerMessageInputPort = envoyerMessageInputPort;
    }

    @PostConstruct
    public void startServer() {
        // Connexion client
        server.addConnectListener(client -> {
            System.out.println("[Socket.IO] Client connecté: " + client.getSessionId());
        });

        // Déconnexion client
        server.addDisconnectListener(client -> {
            System.out.println("[Socket.IO] Client déconnecté: " + client.getSessionId());
        });

        // Evénement 'join_room' : Rejoint un salon de discussion / une commande
        server.addEventListener("join_room", JoinRoomPayload.class, onJoinRoom());

        // Evénement 'send_message' : Reçoit un nouveau message, persiste et diffuse à la room
        server.addEventListener("send_message", SendMessagePayload.class, onSendMessage());

        server.start();
        System.out.println("[Socket.IO] Serveur WebSocket démarré sur le port " + server.getConfiguration().getPort());
    }

    @PreDestroy
    public void stopServer() {
        if (server != null) {
            server.stop();
            System.out.println("[Socket.IO] Serveur WebSocket arrêté.");
        }
    }

    private DataListener<JoinRoomPayload> onJoinRoom() {
        return (client, payload, ackSender) -> {
            if (payload != null && payload.roomId() != null) {
                client.joinRoom(payload.roomId());
                System.out.println("[Socket.IO] Client " + client.getSessionId() + " a rejoint la room: " + payload.roomId());
            }
        };
    }

    private DataListener<SendMessagePayload> onSendMessage() {
        return (client, payload, ackSender) -> {
            if (payload == null || payload.roomId() == null || payload.content() == null) {
                return;
            }

            // 1. Exécute le cas d'utilisation pour persister le message dans PostgreSQL
            EnvoyerMessageInputPort.Command command = new EnvoyerMessageInputPort.Command(
                    payload.roomId(),
                    payload.senderId(),
                    payload.content()
            );

            Message messagePersiste = envoyerMessageInputPort.executer(command);

            // 2. Construit le DTO de diffusion pour les clients
            ReceiveMessagePayload messagePayload = new ReceiveMessagePayload(
                    messagePersiste.getId(),
                    messagePersiste.getRoomId(),
                    messagePersiste.getExpediteur() != null ? messagePersiste.getExpediteur().getId() : null,
                    messagePersiste.getExpediteur() != null ? messagePersiste.getExpediteur().getNom() + " " + messagePersiste.getExpediteur().getPrenom() : "Anonyme",
                    messagePersiste.getContenu(),
                    messagePersiste.getTimestamp().toString()
            );

            // 3. Diffusion de l'événement 'receive_message' à tous les membres connectés dans la room
            server.getRoomOperations(payload.roomId()).sendEvent("receive_message", messagePayload);
        };
    }
}
