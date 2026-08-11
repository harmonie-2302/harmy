package com.harmysewing.presentation.api;

import com.harmysewing.application.ports.in.EnvoyerMessageInputPort;
import com.harmysewing.application.ports.out.MessageRepositoryPort;
import com.harmysewing.application.ports.out.UserRepositoryPort;
import com.harmysewing.domain.models.Message;
import com.harmysewing.domain.models.User;
import com.harmysewing.infrastructure.messaging.dto.ReceiveMessagePayload;
import com.harmysewing.infrastructure.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/conversations")
public class MessagerieController {

    private final MessageRepositoryPort messageRepositoryPort;
    private final EnvoyerMessageInputPort envoyerMessageInputPort;
    private final UserRepositoryPort userRepositoryPort;
    private final JwtTokenProvider jwtTokenProvider;

    public MessagerieController(
            MessageRepositoryPort messageRepositoryPort,
            EnvoyerMessageInputPort envoyerMessageInputPort,
            UserRepositoryPort userRepositoryPort,
            JwtTokenProvider jwtTokenProvider) {
        this.messageRepositoryPort = messageRepositoryPort;
        this.envoyerMessageInputPort = envoyerMessageInputPort;
        this.userRepositoryPort = userRepositoryPort;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    private UUID getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                return jwtTokenProvider.getUserIdFromToken(token);
            } catch (Exception ignored) {}
        }
        return null;
    }

    private String buildRoomId(String user1, String user2) {
        if (user1 == null && user2 == null) return "room_general";
        if (user1 == null) return "room_" + user2;
        if (user2 == null) return "room_" + user1;
        return "room_" + (user1.compareTo(user2) < 0 ? user1 + "_" + user2 : user2 + "_" + user1);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getConversations(HttpServletRequest request) {
        UUID currentUserId = getUserIdFromRequest(request);
        String userIdStr = currentUserId != null ? currentUserId.toString() : "user";

        User currentUser = currentUserId != null ? userRepositoryPort.findById(currentUserId).orElse(null) : null;
        List<User> allUsers = userRepositoryPort.findAll();
        User partner = allUsers.stream().filter(u -> !u.getId().equals(currentUserId)).findFirst().orElse(null);

        String partnerIdStr = partner != null ? partner.getId().toString() : UUID.randomUUID().toString();
        String roomId = buildRoomId(userIdStr, partnerIdStr);

        List<Message> roomMessages = messageRepositoryPort.findByRoomId(roomId);

        Map<String, Object> conv = new HashMap<>();
        conv.put("id", roomId);
        conv.put("members", List.of(userIdStr, partnerIdStr));
        conv.put("atelierId", UUID.randomUUID().toString());
        conv.put("lastMessageAt", !roomMessages.isEmpty() ? roomMessages.get(roomMessages.size() - 1).getTimestamp().toString() : LocalDateTime.now().toString());
        conv.put("lastMessagePreview", !roomMessages.isEmpty() ? roomMessages.get(roomMessages.size() - 1).getContenu() : "Discussion en cours");

        Map<String, Object> memberDetails = new HashMap<>();

        Map<String, Object> userDetail = new HashMap<>();
        userDetail.put("name", currentUser != null ? currentUser.getNom() + " " + currentUser.getPrenom() : "Moi");
        userDetail.put("photoURL", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
        userDetail.put("role", currentUser != null ? currentUser.getRole().name() : "CLIENTE");
        memberDetails.put(userIdStr, userDetail);

        Map<String, Object> partnerDetail = new HashMap<>();
        partnerDetail.put("name", partner != null ? partner.getNom() + " " + partner.getPrenom() : "Maison Awa Couture");
        partnerDetail.put("photoURL", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
        partnerDetail.put("role", partner != null ? partner.getRole().name() : "COUTURIERE");
        memberDetails.put(partnerIdStr, partnerDetail);

        conv.put("memberDetails", memberDetails);

        return ResponseEntity.ok(List.of(conv));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> startConversation(
            HttpServletRequest request,
            @RequestBody Map<String, String> body) {
        UUID currentUserId = getUserIdFromRequest(request);
        String currentStr = currentUserId != null ? currentUserId.toString() : "user";
        String otherUserId = body.get("otherUserId");
        String atelierId = body.get("atelierId");
        String roomId = buildRoomId(currentStr, otherUserId);

        Map<String, Object> conv = new HashMap<>();
        conv.put("id", roomId);
        conv.put("members", List.of(currentStr, otherUserId != null ? otherUserId : "partner"));
        conv.put("atelierId", atelierId != null ? atelierId : UUID.randomUUID().toString());
        conv.put("lastMessageAt", LocalDateTime.now().toString());
        conv.put("lastMessagePreview", "Discussion démarrée");

        Map<String, Object> memberDetails = new HashMap<>();
        Map<String, Object> partnerDetail = new HashMap<>();
        partnerDetail.put("name", "Atelier Harmy'Swing");
        partnerDetail.put("photoURL", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
        partnerDetail.put("role", "COUTURIERE");
        memberDetails.put(otherUserId != null ? otherUserId : "partner", partnerDetail);
        conv.put("memberDetails", memberDetails);

        return ResponseEntity.ok(conv);
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<ReceiveMessagePayload>> listerMessagesParRoom(@PathVariable String roomId) {
        List<ReceiveMessagePayload> messages = messageRepositoryPort.findByRoomId(roomId)
                .stream()
                .map(m -> new ReceiveMessagePayload(
                        m.getId(),
                        m.getRoomId(),
                        m.getExpediteur() != null ? m.getExpediteur().getId() : null,
                        m.getExpediteur() != null ? m.getExpediteur().getNom() + " " + m.getExpediteur().getPrenom() : "Anonyme",
                        m.getContenu(),
                        m.getTimestamp().toString()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{roomId}/messages")
    public ResponseEntity<ReceiveMessagePayload> envoyerMessage(
            @PathVariable String roomId,
            HttpServletRequest request,
            @RequestBody Map<String, String> body) {
        UUID senderId = getUserIdFromRequest(request);
        String text = body.get("text");

        EnvoyerMessageInputPort.Command command = new EnvoyerMessageInputPort.Command(
                roomId,
                senderId,
                text
        );

        Message message = envoyerMessageInputPort.executer(command);

        ReceiveMessagePayload responsePayload = new ReceiveMessagePayload(
                message.getId(),
                message.getRoomId(),
                message.getExpediteur() != null ? message.getExpediteur().getId() : null,
                message.getExpediteur() != null ? message.getExpediteur().getNom() + " " + message.getExpediteur().getPrenom() : "Anonyme",
                message.getContenu(),
                message.getTimestamp().toString()
        );

        return ResponseEntity.ok(responsePayload);
    }
}
