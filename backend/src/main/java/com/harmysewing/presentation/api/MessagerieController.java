package com.harmysewing.presentation.api;

import com.harmysewing.application.ports.in.EnvoyerMessageInputPort;
import com.harmysewing.application.ports.out.MessageRepositoryPort;
import com.harmysewing.application.ports.out.UserRepositoryPort;
import com.harmysewing.application.services.AtelierProvisioningService;
import com.harmysewing.domain.exceptions.DomainException;
import com.harmysewing.domain.models.Atelier;
import com.harmysewing.domain.models.Message;
import com.harmysewing.domain.models.User;
import com.harmysewing.infrastructure.security.CurrentUserProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Messagerie point à point.
 *
 * Aucune table « conversations » n'existe : le salon est déduit des messages
 * réellement échangés, son identifiant encodant les deux participants
 * ({@code room_<uuidA>_<uuidB>}, identifiants triés pour être stables). La
 * liste des conversations est donc construite à partir de la table messages,
 * sans interlocuteur inventé.
 */
@RestController
@RequestMapping("/conversations")
public class MessagerieController {

    private static final String PREFIXE_SALON = "room_";

    private final MessageRepositoryPort messageRepositoryPort;
    private final EnvoyerMessageInputPort envoyerMessageInputPort;
    private final UserRepositoryPort userRepositoryPort;
    private final AtelierProvisioningService atelierProvisioningService;
    private final CurrentUserProvider currentUserProvider;

    public MessagerieController(
            MessageRepositoryPort messageRepositoryPort,
            EnvoyerMessageInputPort envoyerMessageInputPort,
            UserRepositoryPort userRepositoryPort,
            AtelierProvisioningService atelierProvisioningService,
            CurrentUserProvider currentUserProvider) {
        this.messageRepositoryPort = messageRepositoryPort;
        this.envoyerMessageInputPort = envoyerMessageInputPort;
        this.userRepositoryPort = userRepositoryPort;
        this.atelierProvisioningService = atelierProvisioningService;
        this.currentUserProvider = currentUserProvider;
    }

    // ------------------------------------------------------------------
    // Boîte de réception
    // ------------------------------------------------------------------

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listerConversations() {
        User moi = currentUserProvider.exigerUtilisateur();

        // Un salon par interlocuteur, alimenté par les messages persistés.
        Map<String, List<Message>> parSalon = new LinkedHashMap<>();
        for (Message message : messageRepositoryPort.findByParticipant(moi.getId())) {
            parSalon.computeIfAbsent(message.getRoomId(), cle -> new ArrayList<>()).add(message);
        }

        List<Map<String, Object>> conversations = new ArrayList<>();
        for (Map.Entry<String, List<Message>> entree : parSalon.entrySet()) {
            UUID partenaireId = autreParticipant(entree.getKey(), moi.getId());
            if (partenaireId == null) {
                continue;
            }
            User partenaire = userRepositoryPort.findById(partenaireId).orElse(null);
            if (partenaire == null) {
                continue;
            }
            conversations.add(toConversationDto(entree.getKey(), moi, partenaire, entree.getValue()));
        }

        conversations.sort(Comparator.comparing(
                c -> String.valueOf(c.get("lastMessageAt")),
                Comparator.nullsLast(Comparator.reverseOrder())));

        return ResponseEntity.ok(conversations);
    }

    /** Ouvre (ou retrouve) le salon avec un interlocuteur donné. */
    @PostMapping
    public ResponseEntity<Map<String, Object>> demarrerConversation(@RequestBody Map<String, Object> body) {
        User moi = currentUserProvider.exigerUtilisateur();

        UUID partenaireId = resoudreInterlocuteur(body);
        if (partenaireId.equals(moi.getId())) {
            throw new DomainException("Vous ne pouvez pas démarrer une conversation avec vous-même.");
        }

        User partenaire = userRepositoryPort.findById(partenaireId)
                .orElseThrow(() -> new DomainException("Interlocuteur introuvable."));

        String roomId = identifiantSalon(moi.getId(), partenaire.getId());
        List<Message> historique = messageRepositoryPort.findByRoomId(roomId);

        return ResponseEntity.ok(toConversationDto(roomId, moi, partenaire, historique));
    }

    // ------------------------------------------------------------------
    // Fil de discussion
    // ------------------------------------------------------------------

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Map<String, Object>>> listerMessages(@PathVariable String roomId) {
        User moi = currentUserProvider.exigerUtilisateur();
        exigerParticipation(roomId, moi);

        List<Map<String, Object>> messages = messageRepositoryPort.findByRoomId(roomId).stream()
                .map(this::toMessageDto)
                .toList();

        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{roomId}/messages")
    public ResponseEntity<Map<String, Object>> envoyerMessage(
            @PathVariable String roomId,
            @RequestBody Map<String, Object> body) {

        User moi = currentUserProvider.exigerUtilisateur();
        exigerParticipation(roomId, moi);

        Object brut = body.get("text") != null ? body.get("text") : body.get("contenu");
        String texte = brut != null ? brut.toString().trim() : "";
        if (texte.isEmpty()) {
            throw new DomainException("Le message ne peut pas être vide.");
        }

        Message message = envoyerMessageInputPort.executer(
                new EnvoyerMessageInputPort.Command(roomId, moi.getId(), texte));

        return ResponseEntity.ok(toMessageDto(message));
    }

    // ------------------------------------------------------------------
    // Sérialisation
    // ------------------------------------------------------------------

    /** Forme attendue par le frontend : {id, conversationId, from, type, text, createdAt}. */
    private Map<String, Object> toMessageDto(Message message) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", message.getId() != null ? message.getId().toString() : null);
        dto.put("conversationId", message.getRoomId());
        dto.put("from", message.getExpediteur() != null ? message.getExpediteur().getId().toString() : null);
        dto.put("type", "text");
        dto.put("text", message.getContenu());
        dto.put("createdAt", message.getTimestamp() != null ? message.getTimestamp().toString() : null);
        return dto;
    }

    private Map<String, Object> toConversationDto(String roomId, User moi, User partenaire, List<Message> historique) {
        Message dernier = historique.isEmpty() ? null : historique.get(historique.size() - 1);

        Map<String, Object> conversation = new LinkedHashMap<>();
        conversation.put("id", roomId);
        conversation.put("members", List.of(moi.getId().toString(), partenaire.getId().toString()));
        conversation.put("atelierId", atelierDeLaDiscussion(moi, partenaire));
        conversation.put("lastMessageAt", dernier != null && dernier.getTimestamp() != null
                ? dernier.getTimestamp().toString()
                : LocalDateTime.now().toString());
        conversation.put("lastMessagePreview", dernier != null ? dernier.getContenu() : "");

        Map<String, Object> details = new LinkedHashMap<>();
        details.put(moi.getId().toString(), toMembreDto(moi));
        details.put(partenaire.getId().toString(), toMembreDto(partenaire));
        conversation.put("memberDetails", details);

        return conversation;
    }

    private Map<String, Object> toMembreDto(User user) {
        Map<String, Object> membre = new LinkedHashMap<>();
        membre.put("name", user.getDisplayName());
        membre.put("photoURL", user.getPhotoUrl());
        membre.put("role", user.getRole() != null ? user.getRole().name() : null);
        return membre;
    }

    /** L'atelier concerné, dès qu'un des deux interlocuteurs est couturière. */
    private String atelierDeLaDiscussion(User moi, User partenaire) {
        User couturiere = moi.isCouturiere() ? moi : (partenaire.isCouturiere() ? partenaire : null);
        if (couturiere == null) {
            return null;
        }
        return atelierProvisioningService.trouverPourCouturiere(couturiere.getId())
                .map(Atelier::getId)
                .map(UUID::toString)
                .orElse(null);
    }

    // ------------------------------------------------------------------
    // Utilitaires
    // ------------------------------------------------------------------

    /** Identifiant stable : les deux UUID sont triés pour ne pas dépendre de l'appelant. */
    private String identifiantSalon(UUID a, UUID b) {
        String premier = a.toString();
        String second = b.toString();
        return PREFIXE_SALON + (premier.compareTo(second) < 0
                ? premier + "_" + second
                : second + "_" + premier);
    }

    private UUID autreParticipant(String roomId, UUID moi) {
        for (UUID participant : participants(roomId)) {
            if (!participant.equals(moi)) {
                return participant;
            }
        }
        return null;
    }

    private List<UUID> participants(String roomId) {
        if (roomId == null || !roomId.startsWith(PREFIXE_SALON)) {
            return List.of();
        }
        List<UUID> identifiants = new ArrayList<>();
        for (String fragment : roomId.substring(PREFIXE_SALON.length()).split("_")) {
            try {
                identifiants.add(UUID.fromString(fragment));
            } catch (IllegalArgumentException ignored) {
                // Fragment non conforme : ignoré, le salon sera jugé inaccessible.
            }
        }
        return identifiants;
    }

    /** Un salon n'est lisible que par ses deux participants (ou l'administration). */
    private void exigerParticipation(String roomId, User user) {
        if (user.isAdmin()) {
            return;
        }
        if (!participants(roomId).contains(user.getId())) {
            throw new DomainException("Cette conversation ne vous est pas accessible.");
        }
    }

    /**
     * L'interface envoie soit l'identifiant d'un utilisateur, soit celui d'un
     * atelier (bouton « Contacter l'atelier ») : les deux sont acceptés.
     */
    private UUID resoudreInterlocuteur(Map<String, Object> body) {
        UUID direct = uuidOuNull(body.get("otherUserId"));
        if (direct == null) {
            direct = uuidOuNull(body.get("couturiereId"));
        }
        if (direct != null && userRepositoryPort.findById(direct).isPresent()) {
            return direct;
        }

        UUID atelierId = uuidOuNull(body.get("atelierId"));
        if (atelierId == null) {
            atelierId = direct;
        }
        if (atelierId != null) {
            UUID recherche = atelierId;
            Optional<User> proprietaire = userRepositoryPort.findAll().stream()
                    .filter(User::isCouturiere)
                    .filter(u -> atelierProvisioningService.trouverPourCouturiere(u.getId())
                            .map(a -> recherche.equals(a.getId()))
                            .orElse(false))
                    .findFirst();
            if (proprietaire.isPresent()) {
                return proprietaire.get().getId();
            }
        }

        throw new DomainException("Destinataire de la conversation introuvable.");
    }

    private UUID uuidOuNull(Object valeur) {
        if (valeur == null) {
            return null;
        }
        try {
            return UUID.fromString(valeur.toString().trim());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
