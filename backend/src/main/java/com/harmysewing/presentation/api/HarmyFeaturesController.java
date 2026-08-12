package com.harmysewing.presentation.api;

import com.harmysewing.application.ports.out.AtelierRepositoryPort;
import com.harmysewing.application.ports.out.CommandeRepositoryPort;
import com.harmysewing.application.ports.out.UserRepositoryPort;
import com.harmysewing.application.services.AtelierProvisioningService;
import com.harmysewing.domain.exceptions.DomainException;
import com.harmysewing.domain.models.Atelier;
import com.harmysewing.domain.models.Commande;
import com.harmysewing.domain.models.StatutCommande;
import com.harmysewing.domain.models.User;
import com.harmysewing.infrastructure.persistence.entities.*;
import com.harmysewing.infrastructure.persistence.repositories.*;
import com.harmysewing.infrastructure.security.CurrentUserProvider;
import com.harmysewing.presentation.dtos.UserResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Publications, clients d'atelier, tâches, finances et administration.
 *
 * Toutes les données renvoyées proviennent de la base : aucun contenu de
 * démonstration n'est inséré ni substitué.
 */
@RestController
public class HarmyFeaturesController {

    private static final String DEVISE = "FC";

    private final CommandeRepositoryPort commandeRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;
    private final AtelierRepositoryPort atelierRepositoryPort;
    private final PostSpringDataRepository postRepository;
    private final CustomerSpringDataRepository customerRepository;
    private final TaskSpringDataRepository taskRepository;
    private final CommentSpringDataRepository commentRepository;
    private final ReportSpringDataRepository reportRepository;
    private final CurrentUserProvider currentUserProvider;
    private final AtelierProvisioningService atelierProvisioningService;

    public HarmyFeaturesController(
            CommandeRepositoryPort commandeRepositoryPort,
            UserRepositoryPort userRepositoryPort,
            AtelierRepositoryPort atelierRepositoryPort,
            PostSpringDataRepository postRepository,
            CustomerSpringDataRepository customerRepository,
            TaskSpringDataRepository taskRepository,
            CommentSpringDataRepository commentRepository,
            ReportSpringDataRepository reportRepository,
            CurrentUserProvider currentUserProvider,
            AtelierProvisioningService atelierProvisioningService) {
        this.commandeRepositoryPort = commandeRepositoryPort;
        this.userRepositoryPort = userRepositoryPort;
        this.atelierRepositoryPort = atelierRepositoryPort;
        this.postRepository = postRepository;
        this.customerRepository = customerRepository;
        this.taskRepository = taskRepository;
        this.commentRepository = commentRepository;
        this.reportRepository = reportRepository;
        this.currentUserProvider = currentUserProvider;
        this.atelierProvisioningService = atelierProvisioningService;
    }

    // ------------------------------------------------------------------
    // Publications (catalogue)
    // ------------------------------------------------------------------

    @GetMapping("/posts")
    public ResponseEntity<List<Map<String, Object>>> getPosts(@RequestParam(required = false) String tag) {
        List<PostJpaEntity> posts = (tag != null && !tag.isBlank())
                ? postRepository.findByTagsContainingIgnoreCase(tag)
                : postRepository.findAll();

        List<Map<String, Object>> dtos = posts.stream()
                .sorted(Comparator.comparing(
                        PostJpaEntity::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toPostDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/posts/mine")
    public ResponseEntity<List<Map<String, Object>>> getMesPublications() {
        User user = currentUserProvider.exigerCouturiere();
        List<Map<String, Object>> dtos = postRepository.findAll().stream()
                .filter(p -> user.getId().equals(p.getAuthorId()))
                .sorted(Comparator.comparing(
                        PostJpaEntity::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toPostDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/posts")
    public ResponseEntity<Map<String, Object>> createPost(@RequestBody Map<String, Object> request) {
        User auteur = currentUserProvider.exigerCouturiere();
        Atelier atelier = atelierProvisioningService.assurerAtelier(auteur);

        String caption = texte(request.get("caption"));
        if (caption.isBlank()) {
            throw new DomainException("La description de la création est obligatoire.");
        }

        List<String> media = listeDeTextes(request.get("media"));
        if (media.isEmpty()) {
            throw new DomainException("Ajoutez au moins une photo de votre création.");
        }

        PostJpaEntity post = new PostJpaEntity(
                UUID.randomUUID(),
                auteur.getId(),
                atelier.getNom() != null ? atelier.getNom() : auteur.getDisplayName(),
                auteur.getPhotoUrl(),
                atelier.getId(),
                caption,
                nombre(request.get("priceHint"), 0.0),
                DEVISE,
                String.join(",", listeDeTextes(request.get("tags"))),
                LocalDateTime.now(),
                new ArrayList<>(media),
                new ArrayList<>()
        );

        return ResponseEntity.ok(toPostDto(postRepository.save(post)));
    }

    @PutMapping("/posts/{postId}")
    public ResponseEntity<Map<String, Object>> updatePost(
            @PathVariable UUID postId,
            @RequestBody Map<String, Object> request) {

        User user = currentUserProvider.exigerUtilisateur();
        PostJpaEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new DomainException("Publication introuvable."));
        exigerProprietaireDePublication(user, post);

        if (request.get("caption") != null) {
            String caption = texte(request.get("caption"));
            if (caption.isBlank()) {
                throw new DomainException("La description de la création est obligatoire.");
            }
            post.setCaption(caption);
        }
        if (request.get("priceHint") != null) {
            post.setPriceHint(nombre(request.get("priceHint"), post.getPriceHint()));
        }
        if (request.get("tags") != null) {
            post.setTags(String.join(",", listeDeTextes(request.get("tags"))));
        }
        if (request.get("media") != null) {
            List<String> media = listeDeTextes(request.get("media"));
            if (media.isEmpty()) {
                throw new DomainException("Une publication doit conserver au moins une photo.");
            }
            post.getMedia().clear();
            post.getMedia().addAll(media);
        }

        return ResponseEntity.ok(toPostDto(postRepository.save(post)));
    }

    @DeleteMapping("/posts/{postId}")
    @Transactional
    public ResponseEntity<Void> deletePost(@PathVariable UUID postId) {
        User user = currentUserProvider.exigerUtilisateur();
        PostJpaEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new DomainException("Publication introuvable."));
        exigerProprietaireDePublication(user, post);

        commentRepository.deleteAll(commentRepository.findByPostId(postId));
        postRepository.delete(post);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/posts/{postId}/like")
    @Transactional
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable UUID postId) {
        User user = currentUserProvider.exigerUtilisateur();
        PostJpaEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new DomainException("Publication introuvable."));

        if (post.getLikes().contains(user.getId())) {
            post.getLikes().remove(user.getId());
        } else {
            post.getLikes().add(user.getId());
        }

        return ResponseEntity.ok(toPostDto(postRepository.save(post)));
    }

    @PostMapping("/posts/{postId}/comment")
    public ResponseEntity<Map<String, Object>> addComment(
            @PathVariable UUID postId,
            @RequestBody Map<String, Object> body) {

        User auteur = currentUserProvider.exigerUtilisateur();
        PostJpaEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new DomainException("Publication introuvable."));

        String text = texte(body.get("text"));
        if (text.isBlank()) {
            throw new DomainException("Le commentaire ne peut pas être vide.");
        }

        commentRepository.save(new CommentJpaEntity(
                UUID.randomUUID(),
                post.getId(),
                auteur.getDisplayName(),
                auteur.getPhotoUrl(),
                text,
                LocalDateTime.now(),
                auteur.getId()
        ));

        // La publication complète permet au frontend de rafraîchir les compteurs.
        return ResponseEntity.ok(toPostDto(post));
    }

    @DeleteMapping("/posts/{postId}/comments/{commentId}")
    public ResponseEntity<Map<String, Object>> deleteComment(
            @PathVariable UUID postId,
            @PathVariable UUID commentId) {

        User user = currentUserProvider.exigerUtilisateur();
        PostJpaEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new DomainException("Publication introuvable."));
        CommentJpaEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new DomainException("Commentaire introuvable."));

        boolean auteurDuCommentaire = user.getId().equals(comment.getAuthorId());
        boolean auteurDeLaPublication = user.getId().equals(post.getAuthorId());
        if (!auteurDuCommentaire && !auteurDeLaPublication && !user.isAdmin()) {
            throw new DomainException("Vous ne pouvez supprimer que vos propres commentaires.");
        }

        commentRepository.delete(comment);
        return ResponseEntity.ok(toPostDto(post));
    }

    // ------------------------------------------------------------------
    // Clients de l'atelier
    // ------------------------------------------------------------------

    @GetMapping("/customers")
    public ResponseEntity<List<Map<String, Object>>> getCustomers() {
        User user = currentUserProvider.exigerUtilisateur();

        List<CustomerJpaEntity> customers;
        if (user.isAdmin()) {
            customers = customerRepository.findAll();
        } else if (user.isCouturiere()) {
            customers = customerRepository.findByAtelierId(atelierCourant(user).getId());
        } else {
            // Une cliente ne voit que les fiches qui la concernent.
            customers = customerRepository.findAll().stream()
                    .filter(c -> user.getId().equals(c.getRegisteredUserId()))
                    .collect(Collectors.toList());
        }

        List<Map<String, Object>> dtos = customers.stream()
                .sorted(Comparator.comparing(
                        CustomerJpaEntity::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toCustomerDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/customers")
    public ResponseEntity<Map<String, Object>> createCustomer(@RequestBody Map<String, Object> request) {
        User couturiere = currentUserProvider.exigerCouturiere();
        Atelier atelier = atelierCourant(couturiere);

        String name = texte(request.get("name"));
        if (name.isBlank()) {
            throw new DomainException("Le nom de la cliente est obligatoire.");
        }

        Map<String, Object> mesures = mapDe(request.get("measurements"));
        UUID registeredUserId = uuidOuNull(request.get("registeredUserId"));
        String type = texte(request.get("type"));

        CustomerJpaEntity customer = new CustomerJpaEntity(
                UUID.randomUUID(),
                atelier.getId(),
                type.isBlank() ? (registeredUserId != null ? "registered" : "local") : type,
                registeredUserId,
                name,
                texte(request.get("phone")),
                texte(request.get("notes")),
                nombre(mesures.get("bust"), 0.0),
                nombre(mesures.get("waist"), 0.0),
                nombre(mesures.get("hips"), 0.0),
                nombre(mesures.get("arm"), 0.0),
                LocalDateTime.now()
        );

        return ResponseEntity.ok(toCustomerDto(customerRepository.save(customer)));
    }

    @PutMapping("/customers/{id}")
    public ResponseEntity<Map<String, Object>> updateCustomer(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> request) {

        User couturiere = currentUserProvider.exigerCouturiere();
        CustomerJpaEntity c = customerRepository.findById(id)
                .orElseThrow(() -> new DomainException("Fiche cliente introuvable."));
        exigerAtelier(couturiere, c.getAtelierId(), "Cette fiche cliente appartient à un autre atelier.");

        if (request.get("name") != null) {
            String name = texte(request.get("name"));
            if (name.isBlank()) {
                throw new DomainException("Le nom de la cliente est obligatoire.");
            }
            c.setName(name);
        }
        if (request.get("phone") != null) c.setPhone(texte(request.get("phone")));
        if (request.get("notes") != null) c.setNotes(texte(request.get("notes")));

        Map<String, Object> mesures = mapDe(request.get("measurements"));
        if (mesures.get("bust") != null) c.setBust(nombre(mesures.get("bust"), c.getBust()));
        if (mesures.get("waist") != null) c.setWaist(nombre(mesures.get("waist"), c.getWaist()));
        if (mesures.get("hips") != null) c.setHips(nombre(mesures.get("hips"), c.getHips()));
        if (mesures.get("arm") != null) c.setArm(nombre(mesures.get("arm"), c.getArm()));

        return ResponseEntity.ok(toCustomerDto(customerRepository.save(c)));
    }

    @DeleteMapping("/customers/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable UUID id) {
        User couturiere = currentUserProvider.exigerCouturiere();
        CustomerJpaEntity c = customerRepository.findById(id)
                .orElseThrow(() -> new DomainException("Fiche cliente introuvable."));
        exigerAtelier(couturiere, c.getAtelierId(), "Cette fiche cliente appartient à un autre atelier.");

        customerRepository.delete(c);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------------------------------------------
    // Finances
    // ------------------------------------------------------------------

    @GetMapping("/finance/summary")
    public ResponseEntity<Map<String, Object>> getFinanceSummary() {
        User user = currentUserProvider.exigerUtilisateur();

        List<Commande> commandes;
        if (user.isAdmin()) {
            commandes = commandeRepositoryPort.findAll();
        } else if (user.isCouturiere()) {
            commandes = commandeRepositoryPort.findByAtelierId(atelierCourant(user).getId());
        } else {
            commandes = commandeRepositoryPort.findByClientId(user.getId());
        }

        double totalRevenue = 0.0;
        double totalDeposits = 0.0;
        double totalBalancesDue = 0.0;
        int enCours = 0;

        for (Commande c : commandes) {
            double total = c.getPrixTotal() != null ? c.getPrixTotal() : 0.0;
            double deposit = c.getAcompteVerse() != null ? c.getAcompteVerse() : 0.0;
            double balance = c.getSoldeRestant() != null ? c.getSoldeRestant() : Math.max(0.0, total - deposit);

            totalRevenue += total;
            totalDeposits += deposit;
            totalBalancesDue += balance;

            if (c.getStatut() != StatutCommande.LIVRE) {
                enCours++;
            }
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("currency", DEVISE);
        summary.put("totalRevenue", arrondir(totalRevenue));
        summary.put("totalDeposits", arrondir(totalDeposits));
        summary.put("totalBalancesDue", arrondir(totalBalancesDue));
        summary.put("orderCount", commandes.size());
        summary.put("activeOrderCount", enCours);
        return ResponseEntity.ok(summary);
    }

    // ------------------------------------------------------------------
    // Tâches
    // ------------------------------------------------------------------

    @GetMapping("/tasks")
    public ResponseEntity<List<Map<String, Object>>> getTasks() {
        User user = currentUserProvider.exigerUtilisateur();

        List<TaskJpaEntity> tasks;
        if (user.isAdmin()) {
            tasks = taskRepository.findAll();
        } else if (user.isCouturiere()) {
            tasks = taskRepository.findByAtelierId(atelierCourant(user).getId());
        } else {
            // Le pense-bête est un outil interne à l'atelier.
            tasks = List.of();
        }

        List<Map<String, Object>> dtos = tasks.stream()
                .sorted(Comparator.comparing(
                        TaskJpaEntity::getDueDate,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::toTaskDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/tasks")
    public ResponseEntity<Map<String, Object>> createTask(@RequestBody Map<String, Object> request) {
        User couturiere = currentUserProvider.exigerCouturiere();
        Atelier atelier = atelierCourant(couturiere);

        String title = texte(request.get("title"));
        if (title.isBlank()) {
            throw new DomainException("L'intitulé de la tâche est obligatoire.");
        }

        LocalDateTime echeance = dateOuNull(request.get("dueDate"));

        TaskJpaEntity entity = new TaskJpaEntity(
                UUID.randomUUID(),
                atelier.getId(),
                title,
                false,
                echeance
        );

        return ResponseEntity.ok(toTaskDto(taskRepository.save(entity)));
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<Map<String, Object>> updateTask(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, Object> body) {

        User couturiere = currentUserProvider.exigerCouturiere();
        TaskJpaEntity task = taskRepository.findById(id)
                .orElseThrow(() -> new DomainException("Tâche introuvable."));
        exigerAtelier(couturiere, task.getAtelierId(), "Cette tâche appartient à un autre atelier.");

        Map<String, Object> request = body != null ? body : Map.of();

        if (request.get("title") != null) {
            String title = texte(request.get("title"));
            if (!title.isBlank()) {
                task.setTitle(title);
            }
        }
        if (request.get("dueDate") != null) {
            task.setDueDate(dateOuNull(request.get("dueDate")));
        }

        if (request.get("completed") != null) {
            task.setCompleted(Boolean.parseBoolean(request.get("completed").toString()));
        } else {
            // Sans corps explicite, l'appel bascule l'état courant.
            task.setCompleted(!Boolean.TRUE.equals(task.getCompleted()));
        }

        return ResponseEntity.ok(toTaskDto(taskRepository.save(task)));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id) {
        User couturiere = currentUserProvider.exigerCouturiere();
        TaskJpaEntity task = taskRepository.findById(id)
                .orElseThrow(() -> new DomainException("Tâche introuvable."));
        exigerAtelier(couturiere, task.getAtelierId(), "Cette tâche appartient à un autre atelier.");

        taskRepository.delete(task);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------------------------------------------
    // Administration
    // ------------------------------------------------------------------

    @GetMapping("/admin/reports")
    public ResponseEntity<List<Map<String, Object>>> getAdminReports() {
        currentUserProvider.exigerAdmin();

        List<Map<String, Object>> dtos = reportRepository.findAll().stream()
                .sorted(Comparator.comparing(
                        ReportJpaEntity::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(r -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", r.getId().toString());
                    m.put("postId", r.getPostId().toString());
                    m.put("postTitle", r.getPostTitle());
                    m.put("reason", r.getReason());
                    m.put("reportedBy", r.getReportedBy() != null ? r.getReportedBy().toString() : null);
                    m.put("createdAt", r.getCreatedAt() != null ? r.getCreatedAt().toString() : null);
                    return m;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/admin/reports")
    public ResponseEntity<Map<String, Object>> createReport(@RequestBody Map<String, Object> request) {
        User signaleur = currentUserProvider.exigerUtilisateur();

        UUID postId = uuidOuNull(request.get("postId"));
        if (postId == null) {
            throw new DomainException("Publication à signaler introuvable.");
        }
        PostJpaEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new DomainException("Publication à signaler introuvable."));

        String reason = texte(request.get("reason"));
        if (reason.isBlank()) {
            throw new DomainException("Merci d'indiquer le motif du signalement.");
        }

        String titre = post.getCaption() != null && post.getCaption().length() > 120
                ? post.getCaption().substring(0, 120) + "…"
                : post.getCaption();

        ReportJpaEntity entity = reportRepository.save(new ReportJpaEntity(
                UUID.randomUUID(),
                postId,
                titre != null ? titre : "Publication",
                reason,
                signaleur.getId(),
                LocalDateTime.now()
        ));

        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", entity.getId().toString());
        dto.put("postId", entity.getPostId().toString());
        dto.put("postTitle", entity.getPostTitle());
        dto.put("reason", entity.getReason());
        dto.put("reportedBy", entity.getReportedBy().toString());
        dto.put("createdAt", entity.getCreatedAt().toString());
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/admin/posts/{id}")
    @Transactional
    public ResponseEntity<Void> adminDeletePost(@PathVariable UUID id) {
        currentUserProvider.exigerAdmin();

        PostJpaEntity post = postRepository.findById(id)
                .orElseThrow(() -> new DomainException("Publication introuvable."));

        commentRepository.deleteAll(commentRepository.findByPostId(id));
        reportRepository.deleteAll(reportRepository.findAll().stream()
                .filter(r -> id.equals(r.getPostId()))
                .collect(Collectors.toList()));
        postRepository.delete(post);
        return ResponseEntity.noContent().build();
    }

    /** Active / suspend l'abonnement de la couturière propriétaire de l'atelier. */
    @PutMapping("/admin/ateliers/{id}/subscription")
    public ResponseEntity<Map<String, Object>> adminToggleSubscription(@PathVariable UUID id) {
        currentUserProvider.exigerAdmin();

        Atelier atelier = atelierRepositoryPort.findById(id)
                .orElseThrow(() -> new DomainException("Atelier introuvable."));
        if (atelier.getCouturiere() == null) {
            throw new DomainException("Cet atelier n'a pas de propriétaire rattaché.");
        }

        User proprietaire = userRepositoryPort.findById(atelier.getCouturiere().getId())
                .orElseThrow(() -> new DomainException("Propriétaire de l'atelier introuvable."));

        boolean actifMaintenant = !"active".equalsIgnoreCase(proprietaire.getSubscriptionStatus());
        proprietaire.setSubscriptionStatus(actifMaintenant ? "active" : "inactive");
        proprietaire.setSubscriptionPlan(actifMaintenant ? "Atelier Pro" : null);
        proprietaire.setSubscriptionRenewalDate(actifMaintenant ? LocalDateTime.now().plusMonths(1) : null);
        User sauvegarde = userRepositoryPort.save(proprietaire);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("atelierId", atelier.getId().toString());
        res.put("ownerId", sauvegarde.getId().toString());
        res.put("subscriptionStatus", sauvegarde.getSubscriptionStatus());
        res.put("subscriptionPlan", sauvegarde.getSubscriptionPlan());
        res.put("renewalDate", sauvegarde.getSubscriptionRenewalDate() != null
                ? sauvegarde.getSubscriptionRenewalDate().toString() : null);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/admin/users")
    public ResponseEntity<List<UserResponse>> getAdminUsers() {
        currentUserProvider.exigerAdmin();

        List<UserResponse> users = userRepositoryPort.findAll().stream()
                .map(u -> UserResponse.fromDomain(
                        u,
                        u.isCouturiere()
                                ? atelierProvisioningService.trouverPourCouturiere(u.getId())
                                        .map(Atelier::getId).orElse(null)
                                : null))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    // ------------------------------------------------------------------
    // Sérialisation
    // ------------------------------------------------------------------

    private Map<String, Object> toPostDto(PostJpaEntity p) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", p.getId().toString());
        dto.put("authorId", p.getAuthorId() != null ? p.getAuthorId().toString() : null);
        dto.put("authorName", p.getAuthorName());
        dto.put("authorAvatar", p.getAuthorAvatar() != null ? p.getAuthorAvatar() : "");
        dto.put("atelierId", p.getAtelierId() != null ? p.getAtelierId().toString() : null);
        dto.put("caption", p.getCaption());
        dto.put("priceHint", p.getPriceHint() != null ? p.getPriceHint() : 0.0);
        dto.put("currency", p.getCurrency() != null ? p.getCurrency() : DEVISE);

        List<String> tags = p.getTags() == null || p.getTags().isBlank()
                ? List.of()
                : Arrays.stream(p.getTags().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList());
        dto.put("tags", tags);
        dto.put("media", p.getMedia() != null ? p.getMedia() : List.of());

        List<UUID> likes = p.getLikes() != null ? p.getLikes() : List.of();
        dto.put("likeCount", likes.size());
        dto.put("likes", likes.stream().map(UUID::toString).collect(Collectors.toList()));

        List<Map<String, Object>> comments = commentRepository.findByPostId(p.getId()).stream()
                .sorted(Comparator.comparing(
                        CommentJpaEntity::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(c -> {
                    Map<String, Object> cm = new LinkedHashMap<>();
                    cm.put("id", c.getId().toString());
                    cm.put("authorId", c.getAuthorId() != null ? c.getAuthorId().toString() : null);
                    cm.put("authorName", c.getAuthorName());
                    cm.put("authorAvatar", c.getAuthorAvatar() != null ? c.getAuthorAvatar() : "");
                    cm.put("text", c.getText());
                    cm.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
                    return cm;
                })
                .collect(Collectors.toList());

        dto.put("commentCount", comments.size());
        dto.put("comments", comments);
        dto.put("createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);
        return dto;
    }

    private Map<String, Object> toCustomerDto(CustomerJpaEntity c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId().toString());
        m.put("atelierId", c.getAtelierId() != null ? c.getAtelierId().toString() : null);
        m.put("type", c.getType());
        m.put("registeredUserId", c.getRegisteredUserId() != null ? c.getRegisteredUserId().toString() : null);
        m.put("name", c.getName());
        m.put("phone", c.getPhone() != null ? c.getPhone() : "");
        m.put("notes", c.getNotes() != null ? c.getNotes() : "");

        Map<String, Double> mesures = new LinkedHashMap<>();
        mesures.put("bust", c.getBust() != null ? c.getBust() : 0.0);
        mesures.put("waist", c.getWaist() != null ? c.getWaist() : 0.0);
        mesures.put("hips", c.getHips() != null ? c.getHips() : 0.0);
        mesures.put("arm", c.getArm() != null ? c.getArm() : 0.0);
        m.put("measurements", mesures);

        m.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
        return m;
    }

    private Map<String, Object> toTaskDto(TaskJpaEntity t) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", t.getId().toString());
        m.put("atelierId", t.getAtelierId() != null ? t.getAtelierId().toString() : null);
        m.put("title", t.getTitle());
        m.put("completed", Boolean.TRUE.equals(t.getCompleted()));
        m.put("dueDate", t.getDueDate() != null ? t.getDueDate().toString() : null);
        return m;
    }

    // ------------------------------------------------------------------
    // Utilitaires
    // ------------------------------------------------------------------

    private Atelier atelierCourant(User couturiere) {
        return atelierProvisioningService.assurerAtelier(couturiere);
    }

    private void exigerAtelier(User user, UUID atelierId, String message) {
        if (user.isAdmin()) {
            return;
        }
        if (atelierId == null || !atelierId.equals(atelierCourant(user).getId())) {
            throw new DomainException(message);
        }
    }

    private void exigerProprietaireDePublication(User user, PostJpaEntity post) {
        if (user.isAdmin()) {
            return;
        }
        if (post.getAuthorId() == null || !post.getAuthorId().equals(user.getId())) {
            throw new DomainException("Vous ne pouvez modifier que vos propres publications.");
        }
    }

    private String texte(Object valeur) {
        return valeur != null ? valeur.toString().trim() : "";
    }

    private double nombre(Object valeur, Double defaut) {
        double repli = defaut != null ? defaut : 0.0;
        if (valeur instanceof Number n) {
            return n.doubleValue();
        }
        if (valeur == null) {
            return repli;
        }
        try {
            return Double.parseDouble(valeur.toString().trim());
        } catch (NumberFormatException e) {
            return repli;
        }
    }

    private List<String> listeDeTextes(Object valeur) {
        if (valeur instanceof Collection<?> collection) {
            return collection.stream()
                    .filter(Objects::nonNull)
                    .map(o -> o.toString().trim())
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }
        if (valeur == null) {
            return List.of();
        }
        return Arrays.stream(valeur.toString().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private Map<String, Object> mapDe(Object valeur) {
        if (valeur instanceof Map<?, ?> map) {
            Map<String, Object> resultat = new LinkedHashMap<>();
            map.forEach((k, v) -> resultat.put(String.valueOf(k), v));
            return resultat;
        }
        return Map.of();
    }

    private UUID uuidOuNull(Object valeur) {
        if (valeur == null || valeur.toString().isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(valeur.toString().trim());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    /** Accepte « 2026-08-20 » comme « 2026-08-20T10:15:00 ». */
    private LocalDateTime dateOuNull(Object valeur) {
        String brut = texte(valeur);
        if (brut.isBlank()) {
            return null;
        }
        try {
            return LocalDateTime.parse(brut);
        } catch (DateTimeParseException ignored) {
            // format date seule
        }
        try {
            return LocalDate.parse(brut).atStartOfDay();
        } catch (DateTimeParseException ignored) {
            return null;
        }
    }

    private double arrondir(double valeur) {
        return Math.round(valeur * 100.0) / 100.0;
    }
}
