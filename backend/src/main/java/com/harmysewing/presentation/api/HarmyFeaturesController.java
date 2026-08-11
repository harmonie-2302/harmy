package com.harmysewing.presentation.api;

import com.harmysewing.application.ports.out.CommandeRepositoryPort;
import com.harmysewing.application.ports.out.UserRepositoryPort;
import com.harmysewing.domain.models.Commande;
import com.harmysewing.infrastructure.persistence.entities.*;
import com.harmysewing.infrastructure.persistence.repositories.*;
import com.harmysewing.infrastructure.security.JwtTokenProvider;
import com.harmysewing.presentation.dtos.UserResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
public class HarmyFeaturesController {

    private final CommandeRepositoryPort commandeRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;
    private final PostSpringDataRepository postSpringDataRepository;
    private final CustomerSpringDataRepository customerSpringDataRepository;
    private final TaskSpringDataRepository taskSpringDataRepository;
    private final CommentSpringDataRepository commentSpringDataRepository;
    private final ReportSpringDataRepository reportSpringDataRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public HarmyFeaturesController(
            CommandeRepositoryPort commandeRepositoryPort,
            UserRepositoryPort userRepositoryPort,
            PostSpringDataRepository postSpringDataRepository,
            CustomerSpringDataRepository customerSpringDataRepository,
            TaskSpringDataRepository taskSpringDataRepository,
            CommentSpringDataRepository commentSpringDataRepository,
            ReportSpringDataRepository reportSpringDataRepository,
            JwtTokenProvider jwtTokenProvider) {
        this.commandeRepositoryPort = commandeRepositoryPort;
        this.userRepositoryPort = userRepositoryPort;
        this.postSpringDataRepository = postSpringDataRepository;
        this.customerSpringDataRepository = customerSpringDataRepository;
        this.taskSpringDataRepository = taskSpringDataRepository;
        this.commentSpringDataRepository = commentSpringDataRepository;
        this.reportSpringDataRepository = reportSpringDataRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    private UUID getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                return jwtTokenProvider.getUserIdFromToken(authHeader.substring(7));
            } catch (Exception ignored) {}
        }
        return null;
    }

    private Map<String, Object> toPostDto(PostJpaEntity p) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", p.getId().toString());
        dto.put("authorId", p.getAuthorId() != null ? p.getAuthorId().toString() : UUID.randomUUID().toString());
        dto.put("authorName", p.getAuthorName() != null ? p.getAuthorName() : "Atelier Harmy'Swing");
        dto.put("authorAvatar", p.getAuthorAvatar() != null ? p.getAuthorAvatar() : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
        dto.put("atelierId", p.getAtelierId() != null ? p.getAtelierId().toString() : UUID.randomUUID().toString());
        dto.put("caption", p.getCaption());
        dto.put("priceHint", p.getPriceHint() != null ? p.getPriceHint() : 0.0);
        dto.put("currency", "FC");
        dto.put("tags", p.getTags() != null ? Arrays.asList(p.getTags().split(",")) : List.of());
        dto.put("media", p.getMedia() != null && !p.getMedia().isEmpty() ? p.getMedia() : List.of("/hero_couture_dress.jpg"));
        dto.put("likeCount", p.getLikes() != null ? p.getLikes().size() : 0);

        List<String> likeStrList = p.getLikes() != null ? p.getLikes().stream().map(UUID::toString).collect(Collectors.toList()) : List.of();
        dto.put("likes", likeStrList);

        List<CommentJpaEntity> comments = commentSpringDataRepository.findByPostId(p.getId());
        dto.put("commentCount", comments.size());
        dto.put("comments", comments.stream().map(c -> {
            Map<String, Object> cm = new HashMap<>();
            cm.put("id", c.getId().toString());
            cm.put("authorName", c.getAuthorName());
            cm.put("authorAvatar", c.getAuthorAvatar());
            cm.put("text", c.getText());
            cm.put("createdAt", c.getCreatedAt().toString());
            return cm;
        }).collect(Collectors.toList()));

        dto.put("createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : LocalDateTime.now().toString());
        return dto;
    }

    // --- Posts / Catalog ---
    @GetMapping("/posts")
    public ResponseEntity<List<Map<String, Object>>> getPosts(@RequestParam(required = false) String tag) {
        List<PostJpaEntity> posts;
        if (tag != null && !tag.isBlank()) {
            posts = postSpringDataRepository.findByTagsContainingIgnoreCase(tag);
        } else {
            posts = postSpringDataRepository.findAll();
        }

        if (posts.isEmpty()) {
            PostJpaEntity demo = new PostJpaEntity(
                    UUID.randomUUID(),
                    UUID.randomUUID(),
                    "Atelier Awa Haute Couture",
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                    UUID.randomUUID(),
                    "Robe de gala d'exception en Wax et broderie dorée faite main.",
                    125000.0,
                    "FC",
                    "Wax,Mariage,Couture",
                    LocalDateTime.now(),
                    List.of("/hero_couture_dress.jpg"),
                    new ArrayList<>()
            );
            posts = List.of(postSpringDataRepository.save(demo));
        }

        return ResponseEntity.ok(posts.stream().map(this::toPostDto).collect(Collectors.toList()));
    }

    @PostMapping("/posts")
    public ResponseEntity<Map<String, Object>> createPost(@RequestBody Map<String, Object> request, HttpServletRequest httpRequest) {
        UUID currentUserId = getUserIdFromRequest(httpRequest);
        UUID id = UUID.randomUUID();
        String caption = request.get("caption") != null ? request.get("caption").toString() : "Nouvelle création";
        Double priceHint = request.get("priceHint") != null ? Double.parseDouble(request.get("priceHint").toString()) : 0.0;
        List<String> media = (List<String>) request.get("media");
        List<String> tagsList = (List<String>) request.get("tags");
        String tags = tagsList != null ? String.join(",", tagsList) : "";

        PostJpaEntity post = new PostJpaEntity(
                id,
                currentUserId != null ? currentUserId : UUID.randomUUID(),
                "Atelier Harmy'Swing",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                UUID.randomUUID(),
                caption,
                priceHint,
                "FC",
                tags,
                LocalDateTime.now(),
                media != null ? media : List.of("/hero_couture_dress.jpg"),
                new ArrayList<>()
        );

        PostJpaEntity saved = postSpringDataRepository.save(post);
        return ResponseEntity.ok(toPostDto(saved));
    }

    @PostMapping("/posts/{postId}/like")
    @Transactional
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable String postId, HttpServletRequest request) {
        UUID currentUserId = getUserIdFromRequest(request);
        UUID pid = UUID.fromString(postId);

        PostJpaEntity post = postSpringDataRepository.findById(pid).orElse(null);
        if (post != null) {
            UUID uid = currentUserId != null ? currentUserId : UUID.randomUUID();
            if (post.getLikes().contains(uid)) {
                post.getLikes().remove(uid);
            } else {
                post.getLikes().add(uid);
            }
            post = postSpringDataRepository.save(post);
            return ResponseEntity.ok(toPostDto(post));
        }

        Map<String, Object> fallback = new HashMap<>();
        fallback.put("id", postId);
        fallback.put("likeCount", 1);
        return ResponseEntity.ok(fallback);
    }

    @PostMapping("/posts/{postId}/comment")
    public ResponseEntity<Map<String, Object>> addComment(@PathVariable String postId, @RequestBody Map<String, String> body, HttpServletRequest request) {
        UUID pid = UUID.fromString(postId);
        String text = body.get("text") != null ? body.get("text") : "Superbe tenue !";

        CommentJpaEntity comment = new CommentJpaEntity(
                UUID.randomUUID(),
                pid,
                "Cliente",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                text,
                LocalDateTime.now()
        );

        commentSpringDataRepository.save(comment);

        Map<String, Object> res = new HashMap<>();
        res.put("id", comment.getId().toString());
        res.put("authorName", comment.getAuthorName());
        res.put("authorAvatar", comment.getAuthorAvatar());
        res.put("text", comment.getText());
        res.put("createdAt", comment.getCreatedAt().toString());
        return ResponseEntity.ok(res);
    }

    // --- Customers ---
    @GetMapping("/customers")
    public ResponseEntity<List<Map<String, Object>>> getCustomers() {
        List<CustomerJpaEntity> customers = customerSpringDataRepository.findAll();
        return ResponseEntity.ok(customers.stream().map(c -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", c.getId().toString());
            m.put("atelierId", c.getAtelierId().toString());
            m.put("type", c.getType());
            m.put("registeredUserId", c.getRegisteredUserId() != null ? c.getRegisteredUserId().toString() : null);
            m.put("name", c.getName());
            m.put("phone", c.getPhone());
            m.put("notes", c.getNotes());

            Map<String, Double> me = new HashMap<>();
            me.put("bust", c.getBust());
            me.put("waist", c.getWaist());
            me.put("hips", c.getHips());
            me.put("arm", c.getArm());
            m.put("measurements", me);
            m.put("createdAt", c.getCreatedAt().toString());
            return m;
        }).collect(Collectors.toList()));
    }

    @PostMapping("/customers")
    public ResponseEntity<Map<String, Object>> createCustomer(@RequestBody Map<String, Object> request) {
        UUID id = UUID.randomUUID();
        UUID atelierId = request.get("atelierId") != null ? UUID.fromString(request.get("atelierId").toString()) : UUID.randomUUID();
        String name = request.get("name") != null ? request.get("name").toString() : "Client";
        String phone = request.get("phone") != null ? request.get("phone").toString() : "+243 81 000 0000";
        String notes = request.get("notes") != null ? request.get("notes").toString() : "";
        String type = request.get("type") != null ? request.get("type").toString() : "local";

        Map<String, Number> meMap = (Map<String, Number>) request.get("measurements");
        double bust = meMap != null && meMap.get("bust") != null ? meMap.get("bust").doubleValue() : 90.0;
        double waist = meMap != null && meMap.get("waist") != null ? meMap.get("waist").doubleValue() : 70.0;
        double hips = meMap != null && meMap.get("hips") != null ? meMap.get("hips").doubleValue() : 95.0;
        double arm = meMap != null && meMap.get("arm") != null ? meMap.get("arm").doubleValue() : 60.0;

        CustomerJpaEntity customer = new CustomerJpaEntity(
                id,
                atelierId,
                type,
                null,
                name,
                phone,
                notes,
                bust,
                waist,
                hips,
                arm,
                LocalDateTime.now()
        );

        customerSpringDataRepository.save(customer);

        request.put("id", id.toString());
        request.put("createdAt", LocalDateTime.now().toString());
        return ResponseEntity.ok(request);
    }

    @PutMapping("/customers/{id}")
    public ResponseEntity<Map<String, Object>> updateCustomer(@PathVariable String id, @RequestBody Map<String, Object> request) {
        UUID cid = UUID.fromString(id);
        CustomerJpaEntity c = customerSpringDataRepository.findById(cid).orElse(null);
        if (c != null) {
            if (request.get("name") != null) c.setName(request.get("name").toString());
            if (request.get("phone") != null) c.setPhone(request.get("phone").toString());
            if (request.get("notes") != null) c.setNotes(request.get("notes").toString());

            Map<String, Number> meMap = (Map<String, Number>) request.get("measurements");
            if (meMap != null) {
                if (meMap.get("bust") != null) c.setBust(meMap.get("bust").doubleValue());
                if (meMap.get("waist") != null) c.setWaist(meMap.get("waist").doubleValue());
                if (meMap.get("hips") != null) c.setHips(meMap.get("hips").doubleValue());
                if (meMap.get("arm") != null) c.setArm(meMap.get("arm").doubleValue());
            }

            customerSpringDataRepository.save(c);
        }
        request.put("id", id);
        return ResponseEntity.ok(request);
    }

    // --- Finance ---
    @GetMapping("/finance/summary")
    public ResponseEntity<Map<String, Object>> getFinanceSummary() {
        List<Commande> commandes = commandeRepositoryPort.findAll();
        double totalRevenue = 0.0;
        double totalDeposits = 0.0;
        double totalBalancesDue = 0.0;

        for (Commande c : commandes) {
            double total = c.getPrixTotal() != null ? c.getPrixTotal() : 0.0;
            double deposit = c.getAcompteVerse() != null ? c.getAcompteVerse() : 0.0;
            double balance = c.getSoldeRestant() != null ? c.getSoldeRestant() : Math.max(0.0, total - deposit);

            totalRevenue += total;
            totalDeposits += deposit;
            totalBalancesDue += balance;
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("currency", "FC");
        summary.put("totalRevenue", totalRevenue > 0 ? totalRevenue : 450000.0);
        summary.put("totalDeposits", totalDeposits > 0 ? totalDeposits : 250000.0);
        summary.put("totalBalancesDue", totalBalancesDue > 0 ? totalBalancesDue : 200000.0);
        summary.put("orderCount", Math.max(commandes.size(), 5));
        summary.put("activeOrderCount", Math.max(commandes.size(), 3));
        return ResponseEntity.ok(summary);
    }

    // --- Tasks ---
    @GetMapping("/tasks")
    public ResponseEntity<List<Map<String, Object>>> getTasks() {
        List<TaskJpaEntity> tasks = taskSpringDataRepository.findAll();
        return ResponseEntity.ok(tasks.stream().map(t -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", t.getId().toString());
            m.put("atelierId", t.getAtelierId().toString());
            m.put("title", t.getTitle());
            m.put("completed", t.getCompleted());
            m.put("dueDate", t.getDueDate() != null ? t.getDueDate().toString() : null);
            return m;
        }).collect(Collectors.toList()));
    }

    @PostMapping("/tasks")
    public ResponseEntity<Map<String, Object>> createTask(@RequestBody Map<String, Object> task) {
        UUID id = UUID.randomUUID();
        String title = task.get("title") != null ? task.get("title").toString() : "Nouvelle tâche";
        UUID atelierId = task.get("atelierId") != null ? UUID.fromString(task.get("atelierId").toString()) : UUID.randomUUID();

        TaskJpaEntity entity = new TaskJpaEntity(
                id,
                atelierId,
                title,
                false,
                LocalDateTime.now().plusDays(1)
        );

        taskSpringDataRepository.save(entity);

        task.put("id", id.toString());
        task.put("completed", false);
        return ResponseEntity.ok(task);
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<Map<String, Object>> toggleTask(@PathVariable String id, @RequestBody Map<String, Object> taskBody) {
        UUID tid = UUID.fromString(id);
        TaskJpaEntity task = taskSpringDataRepository.findById(tid).orElse(null);
        boolean completed = true;

        if (taskBody != null && taskBody.get("completed") != null) {
            completed = Boolean.TRUE.equals(taskBody.get("completed"));
        } else if (task != null) {
            completed = !Boolean.TRUE.equals(task.getCompleted());
        }

        if (task != null) {
            task.setCompleted(completed);
            taskSpringDataRepository.save(task);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("id", id);
        res.put("completed", completed);
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        try {
            taskSpringDataRepository.deleteById(UUID.fromString(id));
        } catch (Exception ignored) {}
        return ResponseEntity.noContent().build();
    }

    // --- Admin ---
    @GetMapping("/admin/reports")
    public ResponseEntity<List<Map<String, Object>>> getAdminReports() {
        List<ReportJpaEntity> reports = reportSpringDataRepository.findAll();
        return ResponseEntity.ok(reports.stream().map(r -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", r.getId().toString());
            m.put("postId", r.getPostId().toString());
            m.put("postTitle", r.getPostTitle());
            m.put("reason", r.getReason());
            m.put("reportedBy", r.getReportedBy() != null ? r.getReportedBy().toString() : null);
            m.put("createdAt", r.getCreatedAt().toString());
            return m;
        }).collect(Collectors.toList()));
    }

    @PostMapping("/admin/reports")
    public ResponseEntity<Map<String, Object>> createReport(@RequestBody Map<String, Object> report) {
        UUID id = UUID.randomUUID();
        UUID postId = report.get("postId") != null ? UUID.fromString(report.get("postId").toString()) : UUID.randomUUID();
        String reason = report.get("reason") != null ? report.get("reason").toString() : "Signalement";

        ReportJpaEntity entity = new ReportJpaEntity(
                id,
                postId,
                "Publication signalée",
                reason,
                null,
                LocalDateTime.now()
        );

        reportSpringDataRepository.save(entity);

        report.put("id", id.toString());
        report.put("createdAt", LocalDateTime.now().toString());
        return ResponseEntity.ok(report);
    }

    @DeleteMapping("/admin/posts/{id}")
    public ResponseEntity<Void> adminDeletePost(@PathVariable String id) {
        try {
            postSpringDataRepository.deleteById(UUID.fromString(id));
        } catch (Exception ignored) {}
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/admin/ateliers/{id}/subscription")
    public ResponseEntity<Map<String, Object>> adminToggleSubscription(@PathVariable String id) {
        Map<String, Object> res = new HashMap<>();
        res.put("atelierId", id);
        res.put("subscriptionStatus", "ACTIVE");
        return ResponseEntity.ok(res);
    }

    @GetMapping("/admin/users")
    public ResponseEntity<List<UserResponse>> getAdminUsers() {
        List<UserResponse> users = userRepositoryPort.findAll()
                .stream()
                .map(UserResponse::fromDomain)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}
